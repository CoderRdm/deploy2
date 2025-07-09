// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student"; // This is already correctly imported as a named export

// --- THIS IS THE CRUCIAL CHANGE ---
// Import Admin as a named export using ES Module syntax
import { Admin } from "@/lib/models/Admin"; // Assuming your jsconfig.json or tsconfig.json has "@/lib" alias
// If the alias doesn't work, you might need the full relative path:
// import { Admin } from "../../../../lib/models/Admin";
// But the alias is preferred for readability and robustness.
// --- END CRUCIAL CHANGE ---

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        await connectToDb();

        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Please enter email and password.");
        }

        console.log('Authorize function called for:', credentials.email);

        // --- 1. Attempt to authenticate as Admin (exclusive via Credentials) ---
        try {
          // Admin is now correctly imported as the model itself
          const adminUser = await Admin.findOne({ email: credentials.email });

          if (adminUser) {
            console.log('Admin user lookup result:', adminUser.email, 'Role:', adminUser.role);
            if (adminUser.password && await adminUser.matchPassword(credentials.password)) {
              console.log('Admin password matched! Returning admin user.');
              return {
                id: adminUser._id.toString(),
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
              };
            } else {
              console.warn(`Admin login failed: password mismatch for email: ${credentials.email}`);
              return null;
            }
          }
        } catch (error) {
          console.error("Error during Admin authorization attempt:", error);
        }

        // --- 2. If not an Admin, attempt to authenticate as Student (can be SPC) via Credentials ---
        try {
            const studentUser = await Student.findOne({ email: credentials.email });

            if (studentUser) {
                console.log('Student user lookup result:', studentUser.email);
                if (studentUser.password && await studentUser.matchPassword(credentials.password)) {
                    console.log('Student password matched! Returning student user.');
                    return {
                        id: studentUser._id.toString(),
                        name: studentUser.name,
                        email: studentUser.email,
                        role: 'student',
                        studentId: studentUser.student_id,
                        isProfileComplete: studentUser.profile_completed,
                        isSPC: studentUser.isSPC,
                    };
                } else {
                    console.warn(`Student login failed: password mismatch or no password set for email: ${credentials.email}`);
                    return null;
                }
            }
        } catch (error) {
            console.error("Error during Student authorization attempt:", error);
        }

        console.warn(`No user found with the provided credentials: ${credentials.email}`);
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectToDb();

      if (account.provider === 'google') {
        const allowedDomain = '@mnit.ac.in';

        try {
            // Admin is now correctly imported as the model itself
            const potentialCredentialUser = await Admin.findOne({ email: user.email });
            if (potentialCredentialUser && (potentialCredentialUser.role === 'admin' || potentialCredentialUser.role === 'spc')) {
                console.warn(`Google sign-in denied: Email ${user.email} is registered as an Admin or Coordinator.`);
                return `/login?error=${encodeURIComponent("Admin/Coordinator accounts cannot sign in with Google. Please use credentials.")}`;
            }
        } catch (error) {
            console.error("Error checking for Admin/SPC during Google sign-in:", error);
        }

        if (!user.email || !user.email.endsWith(allowedDomain)) {
          console.warn(`Authentication denied: Email domain not allowed: ${user.email}`);
          return `/login?error=${encodeURIComponent("Only college email addresses are allowed to sign in.")}`;
        }

        let student = await Student.findOne({ email: user.email });
        let isNewUser = false;

        if (!student) {
          const student_id = `STU_${Date.now()}`;
          student = new Student({
            student_id: student_id,
            email: user.email,
            name: user.name || user.email,
            profile_completed: false,
            isSPC: false,
          });
          await student.save();
          console.log("New student created via Google (NextAuth signIn callback):", student.email);
          isNewUser = true;
        } else {
          console.log("Existing student found via Google (NextAuth signIn callback):", student.email);
        }

        user.id = student._id.toString();
        user.studentId = student.student_id;
        user.isProfileComplete = student.profile_completed;
        user.isNewUser = isNewUser;
        user.role = 'student';
        user.isSPC = student.isSPC;
        
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;

        if (token.role === 'student') {
          token.studentId = user.studentId;
          token.isProfileComplete = user.isProfileComplete;
          token.isNewUser = user.isNewUser;
          token.isSPC = user.isSPC;
        }
      } else if (token.id && token.role) {
        await connectToDb();
        try {
          if (token.role === 'student' && token.id) {
            const student = await Student.findById(token.id);
            if (student) {
              token.isProfileComplete = student.profile_completed;
              token.studentId = student.student_id;
              token.isSPC = student.isSPC;
            } else {
              console.warn(`Student with MongoDB ID ${token.id} not found during JWT re-fetch.`);
            }
          }
           else if (token.role === 'admin' && token.id) {
            const admin = await Admin.findById(token.id);
            if (admin) {
                token.name = admin.name;
                token.email = admin.email;
                token.role = admin.role;
            } else {
                console.warn(`Admin with MongoDB ID ${token.id} not found during JWT re-fetch.`);
            }
           }
        } catch (error) {
          console.error("Error re-fetching user/profile status in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;

      if (token.role === 'student') {
        session.user.studentId = token.studentId;
        session.user.isProfileComplete = token.isProfileComplete;
        session.user.isNewUser = token.isNewUser;
        session.user.isSPC = token.isSPC;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };