// src/app/recruiter/post-internship/page.jsx
'use client';

import { useState } from 'react';

export default function PostInternshipPage() {
    // Initialize formData with all fields from InternshipPostSchema
    const [formData, setFormData] = useState({
        // ABOUT ORGANIZATION
        organizationName: '',
        website: '',
        organizationType: '',
        organizationTypeOther: '',
        industrySector: '',
        industrySectorOther: '',

        // INTERN PROFILE
        internshipProfile: '',
        tentativeDateOfJoining: '', // Use string for date input
        internshipDuration: '',
        placeOfPosting: '',

        // DEGREE/ DISCIPLINE OF STUDENT REQUIRED
        requiredPrograms: [], // Array of strings (e.g., B.Tech., M.Tech.)
        requiredBranches: {
            btech: [],
            barch: [],
            mtech: [],
            mplan: [],
            msc: [],
            mba: [],
            phd: [],
            minorSpecializations: [],
            allBranchesApplicable: false,
        },

        // PROBABLE NUMBER OF POSITIONS YOU ARE SEEKING TO FILL FROM MNIT
        numberOfPositions: '', // Number type

        // CANDIDATE REQUIREMENT
        cgpaRequirements: '',
        studentPassingYearForInternship: [], // Array of strings (e.g., '3rd year')
        anyOtherRequirement: '',

        // REMUNERATION PACKAGE DETAILS
        remuneration: {
            btech: { other: '', stipend: '', ctcPPO: '' },
            mtech: { other: '', stipend: '', ctcPPO: '' },
            mba: { other: '', stipend: '', ctcPPO: '' },
            msc: { other: '', stipend: '', ctcPPO: '' },
            mplan: { other: '', stipend: '', ctcPPO: '' },
            phd: { other: '', stipend: '', ctcPPO: '' },
        },

        // SELECTION PROCEDURE
        preferredDatesForCampusVisit: [], // Array of dates
        numberOfExecutivesVisiting: '',
        numberOfRoomsRequired: '',
        prePlacementTalkRequired: false,
        selectionProcess: {
            aptitudeTest: false,
            technicalTest: false,
            groupDiscussion: false,
            personalInterview: false,
            provisionForWaitlist: false
        },
        finalOfferAnnouncement: '',

        // CONTACT INFORMATION
        contactPerson: '',
        emailAddress: '',
        contactAddress: '',
        mobileNo: '',

        // Signature
        signatureName: '',
        signatureDesignation: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Helper for simple text/select inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Helper for nested objects (e.g., selectionProcess)
    const handleNestedChange = (e, parentName, fieldName) => {
        const { value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [parentName]: {
                ...prev[parentName],
                [fieldName]: type === 'checkbox' ? checked : value
            }
        }));
    };

    // Helper for deeply nested objects (e.g., remuneration.btech.stipend)
    const handleDeepNestedChange = (e, grandParentName, parentName, fieldName) => {
        const { value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [grandParentName]: {
                ...prev[grandParentName],
                [parentName]: {
                    ...prev[grandParentName][parentName],
                    [fieldName]: type === 'checkbox' ? checked : value
                }
            }
        }));
    };

    // Helper for arrays (e.g., requiredPrograms, studentPassingYearForInternship)
    const handleArrayChange = (e, fieldName) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentArray = prev[fieldName];
            if (checked) {
                return { ...prev, [fieldName]: [...currentArray, value] };
            } else {
                return { ...prev, [fieldName]: currentArray.filter(item => item !== value) };
            }
        });
    };

    // Helper for nested arrays (e.g., requiredBranches.btech)
    const handleNestedArrayChange = (e, parentName, fieldName) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentArray = prev.requiredBranches[fieldName];
            if (checked) {
                return {
                    ...prev,
                    requiredBranches: {
                        ...prev.requiredBranches,
                        [fieldName]: [...currentArray, value]
                    }
                };
            } else {
                return {
                    ...prev,
                    requiredBranches: {
                        ...prev.requiredBranches,
                        [fieldName]: currentArray.filter(item => item !== value)
                    }
                };
            }
        });
    };

    // Helper for adding dynamic dates (preferredDatesForCampusVisit)
    const addDate = (fieldName) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: [...prev[fieldName], ''] // Add an empty string for a new date input
        }));
    };

    const removeDate = (fieldName, index) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter((_, i) => i !== index)
        }));
    };

    const handleDateArrayChange = (e, fieldName, index) => {
        const newDates = [...formData[fieldName]];
        newDates[index] = e.target.value;
        setFormData(prev => ({ ...prev, [fieldName]: newDates }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch('/api/recruiter/internship-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Internship post submitted successfully!');
                setIsError(false);
                // Optionally clear form after successful submission (uncomment if desired)
                // setFormData({ /* reset all fields to initial empty state */ });
            } else {
                setMessage(data.message || 'Failed to submit internship post.');
                setIsError(true);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setMessage('An unexpected error occurred. Please try again.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        marginBottom: '5px',
        fontWeight: 'bold',
        display: 'block'
    };

    const sectionHeaderStyle = {
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        marginTop: '20px',
        marginBottom: '15px'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Internship Application Form</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Please fill out the details for your internship opening.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                {/* ABOUT ORGANIZATION */}
                <h3 style={sectionHeaderStyle}>About Organization</h3>
                <div>
                    <label htmlFor="organizationName" style={labelStyle}>Name of the Organization*:</label>
                    <input type="text" id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="website" style={labelStyle}>Website:</label>
                    <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="organizationType" style={labelStyle}>Organization Type*:</label>
                    <select id="organizationType" name="organizationType" value={formData.organizationType} onChange={handleChange} required style={inputStyle}>
                        <option value="">Select Type</option>
                        <option value="Private sector">Private sector</option>
                        <option value="Start-up">Start-up</option>
                        <option value="Govt. owned">Govt. owned</option>
                        <option value="Public sector">Public sector</option>
                        <option value="MNC (Indian/Foreign)">MNC (Indian/Foreign)</option>
                        <option value="other">Other</option>
                    </select>
                    {formData.organizationType === 'other' && (
                        <input type="text" name="organizationTypeOther" placeholder="Specify other type" value={formData.organizationTypeOther} onChange={handleChange} style={{ ...inputStyle, marginTop: '5px' }} />
                    )}
                </div>
                <div>
                    <label htmlFor="industrySector" style={labelStyle}>Industry Sector*:</label>
                    <select id="industrySector" name="industrySector" value={formData.industrySector} onChange={handleChange} required style={inputStyle}>
                        <option value="">Select Sector</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Core (Technical)">Core (Technical)</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                        <option value="Education">Education</option>
                        <option value="Sales & Mktg.">Sales & Mktg.</option>
                        <option value="Management">Management</option>
                        <option value="Other (pls. specify)">Other (pls. specify)</option>
                    </select>
                    {formData.industrySector === 'Other (pls. specify)' && (
                        <input type="text" name="industrySectorOther" placeholder="Specify other sector" value={formData.industrySectorOther} onChange={handleChange} style={{ ...inputStyle, marginTop: '5px' }} />
                    )}
                </div>

                {/* INTERN PROFILE */}
                <h3 style={sectionHeaderStyle}>Intern Profile</h3>
                <div>
                    <label htmlFor="internshipProfile" style={labelStyle}>Internship Profile*:</label>
                    <textarea id="internshipProfile" name="internshipProfile" value={formData.internshipProfile} onChange={handleChange} required rows="4" style={inputStyle}></textarea>
                </div>
                <div>
                    <label htmlFor="tentativeDateOfJoining" style={labelStyle}>Tentative Date of Joining:</label>
                    <input type="date" id="tentativeDateOfJoining" name="tentativeDateOfJoining" value={formData.tentativeDateOfJoining} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="internshipDuration" style={labelStyle}>Internship Duration:</label>
                    <input type="text" id="internshipDuration" name="internshipDuration" value={formData.internshipDuration} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="placeOfPosting" style={labelStyle}>Place of Posting:</label>
                    <input type="text" id="placeOfPosting" name="placeOfPosting" value={formData.placeOfPosting} onChange={handleChange} style={inputStyle} />
                </div>

                {/* DEGREE/ DISCIPLINE OF STUDENT REQUIRED */}
                <h3 style={sectionHeaderStyle}>Degree/Discipline of Student Required</h3>
                <div>
                    <label style={labelStyle}>Required Programs:</label>
                    {['B.Tech.', 'B.Arch.', 'M.Tech.', 'M.Plan', 'M.Sc.', 'MBA', 'Ph.D.'].map(program => (
                        <label key={program} style={{ marginRight: '15px' }}>
                            <input
                                type="checkbox"
                                name="requiredPrograms"
                                value={program}
                                checked={formData.requiredPrograms.includes(program)}
                                onChange={(e) => handleArrayChange(e, 'requiredPrograms')}
                            /> {program}
                        </label>
                    ))}
                </div>
                <div>
                    <label style={labelStyle}>Required Branches:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {/* B.Tech Branches */}
                        <div>
                            <label style={labelStyle}>B.Tech:</label>
                            {['Civil Engineering', 'Chemical Engineering', 'Computer Science & Engineering', 'Electrical Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering', 'Metallurgical & Materials Engineering'].map(branch => (
                                <label key={branch} style={{ display: 'block', marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="btech"
                                        value={branch}
                                        checked={formData.requiredBranches.btech.includes(branch)}
                                        onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'btech')}
                                    /> {branch}
                                </label>
                            ))}
                        </div>
                        {/* B.Arch Branches */}
                        <div>
                            <label style={labelStyle}>B.Arch:</label>
                            <label style={{ display: 'block', marginLeft: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="barch"
                                    value="Architecture & Planning"
                                    checked={formData.requiredBranches.barch.includes('Architecture & Planning')}
                                    onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'barch')}
                                /> Architecture & Planning
                            </label>
                        </div>
                        {/* M.Tech Branches */}
                        <div>
                            <label style={labelStyle}>M.Tech:</label>
                            {['Embedded Systems', 'Computer Engineering', 'Power Systems', 'Structural Engineering'].map(branch => (
                                <label key={branch} style={{ display: 'block', marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="mtech"
                                        value={branch}
                                        checked={formData.requiredBranches.mtech.includes(branch)}
                                        onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'mtech')}
                                    /> {branch}
                                </label>
                            ))}
                        </div>
                        {/* M.Plan Branches */}
                        <div>
                            <label style={labelStyle}>M.Plan:</label>
                            <label style={{ display: 'block', marginLeft: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="mplan"
                                    value="Urban Planning"
                                    checked={formData.requiredBranches.mplan.includes('Urban Planning')}
                                    onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'mplan')}
                                /> Urban Planning
                            </label>
                        </div>
                        {/* M.Sc Branches */}
                        <div>
                            <label style={labelStyle}>M.Sc:</label>
                            {['Mathematics', 'Physics', 'Chemistry'].map(branch => (
                                <label key={branch} style={{ display: 'block', marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="msc"
                                        value={branch}
                                        checked={formData.requiredBranches.msc.includes(branch)}
                                        onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'msc')}
                                    /> {branch}
                                </label>
                            ))}
                        </div>
                        {/* MBA Branches */}
                        <div>
                            <label style={labelStyle}>MBA:</label>
                            {['Operations'].map(branch => ( // Only Operations listed in INF
                                <label key={branch} style={{ display: 'block', marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="mba"
                                        value={branch}
                                        checked={formData.requiredBranches.mba.includes(branch)}
                                        onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'mba')}
                                    /> {branch}
                                </label>
                            ))}
                        </div>
                        {/* PhD Branches */}
                        <div>
                            <label style={labelStyle}>Ph.D:</label>
                            <label style={{ display: 'block', marginLeft: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="phd"
                                    value="All branches" // simplified for INF
                                    checked={formData.requiredBranches.phd.includes('All branches')}
                                    onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'phd')}
                                /> All branches
                            </label>
                        </div>
                        {/* Minor Specializations */}
                        <div>
                            <label style={labelStyle}>Minor Specializations:</label>
                            {['Advanced Manufacturing Technologies', 'Building Science & Services', 'Chemistry', 'Computer Science & Engineering', 'Electric Vehicle', 'Electronics & Communication Engineering', 'Functional Materials', 'Industrial Safety'].map(spec => (
                                <label key={spec} style={{ display: 'block', marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="minorSpecializations"
                                        value={spec}
                                        checked={formData.requiredBranches.minorSpecializations.includes(spec)}
                                        onChange={(e) => handleNestedArrayChange(e, 'requiredBranches', 'minorSpecializations')}
                                    /> {spec}
                                </label>
                            ))}
                        </div>
                        {/* All Branches Applicable */}
                        <div>
                            <label style={labelStyle}>
                                <input
                                    type="checkbox"
                                    name="allBranchesApplicable"
                                    checked={formData.requiredBranches.allBranchesApplicable}
                                    onChange={(e) => handleNestedChange(e, 'requiredBranches', 'allBranchesApplicable')}
                                /> OR All branches applicable
                            </label>
                        </div>
                    </div>
                </div>

                {/* PROBABLE NUMBER OF POSITIONS */}
                <h3 style={sectionHeaderStyle}>Probable Number of Positions You Are Seeking to Fill From MNIT</h3>
                <div>
                    <label htmlFor="numberOfPositions" style={labelStyle}>Number of Positions:</label>
                    <input type="number" id="numberOfPositions" name="numberOfPositions" value={formData.numberOfPositions} onChange={handleChange} min="0" style={inputStyle} />
                </div>

                {/* CANDIDATE REQUIREMENT */}
                <h3 style={sectionHeaderStyle}>Candidate Requirement</h3>
                <div>
                    <label htmlFor="cgpaRequirements" style={labelStyle}>CGPA or % Requirements:</label>
                    <input type="text" id="cgpaRequirements" name="cgpaRequirements" value={formData.cgpaRequirements} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Student Passing Year for Internship:</label>
                    {['1st year', '2nd year', '3rd year', '4th year', '5th year'].map(year => (
                        <label key={year} style={{ marginRight: '15px' }}>
                            <input
                                type="checkbox"
                                name="studentPassingYearForInternship"
                                value={year}
                                checked={formData.studentPassingYearForInternship.includes(year)}
                                onChange={(e) => handleArrayChange(e, 'studentPassingYearForInternship')}
                            /> {year}
                        </label>
                    ))}
                </div>
                <div>
                    <label htmlFor="anyOtherRequirement" style={labelStyle}>Any Other Requirement:</label>
                    <textarea id="anyOtherRequirement" name="anyOtherRequirement" value={formData.anyOtherRequirement} onChange={handleChange} rows="3" style={inputStyle}></textarea>
                </div>

                {/* REMUNERATION PACKAGE DETAILS */}
                <h3 style={sectionHeaderStyle}>Remuneration Package Details</h3>
                {['btech', 'mtech', 'mba', 'msc', 'mplan', 'phd'].map(degree => (
                    <div key={degree} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                        <h4 style={{ marginTop: '0' }}>{degree.toUpperCase()}</h4>
                        <div>
                            <label style={labelStyle}>Other (Accommodation, Food etc.) ({degree}):</label>
                            <input type="text" name="other" value={formData.remuneration[degree].other} onChange={(e) => handleDeepNestedChange(e, 'remuneration', degree, 'other')} style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={labelStyle}>Stipend ({degree}):</label>
                                <input type="number" name="stipend" value={formData.remuneration[degree].stipend} onChange={(e) => handleDeepNestedChange(e, 'remuneration', degree, 'stipend')} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>CTC if PPO offered ({degree}):</label>
                                <input type="number" name="ctcPPO" value={formData.remuneration[degree].ctcPPO} onChange={(e) => handleDeepNestedChange(e, 'remuneration', degree, 'ctcPPO')} style={inputStyle} />
                            </div>
                        </div>
                    </div>
                ))}

                {/* SELECTION PROCEDURE */}
                <h3 style={sectionHeaderStyle}>Selection Procedure</h3>
                <div>
                    <label style={labelStyle}>Preferred Dates for Campus Visit:</label>
                    {formData.preferredDatesForCampusVisit.map((date, index) => (
                        <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateArrayChange(e, 'preferredDatesForCampusVisit', index)}
                                style={inputStyle}
                            />
                            <button type="button" onClick={() => removeDate('preferredDatesForCampusVisit', index)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addDate('preferredDatesForCampusVisit')} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Date</button>
                </div>
                <div>
                    <label htmlFor="numberOfExecutivesVisiting" style={labelStyle}>No. of executives visiting the campus:</label>
                    <input type="number" id="numberOfExecutivesVisiting" name="numberOfExecutivesVisiting" value={formData.numberOfExecutivesVisiting} onChange={handleChange} min="0" style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="numberOfRoomsRequired" style={labelStyle}>No. of rooms required for GD/PI/Test:</label>
                    <input type="number" id="numberOfRoomsRequired" name="numberOfRoomsRequired" value={formData.numberOfRoomsRequired} onChange={handleChange} min="0" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>
                        <input type="checkbox" name="prePlacementTalkRequired" checked={formData.prePlacementTalkRequired} onChange={handleChange} /> Pre-placement Talk required
                    </label>
                </div>

                <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                    <h4 style={{ marginTop: '0' }}>Selection Process</h4>
                    <div>
                        <label style={labelStyle}>
                            <input type="checkbox" name="aptitudeTest" checked={formData.selectionProcess.aptitudeTest} onChange={(e) => handleNestedChange(e, 'selectionProcess', 'aptitudeTest')} /> Aptitude Test
                        </label>
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <input type="checkbox" name="technicalTest" checked={formData.selectionProcess.technicalTest} onChange={(e) => handleNestedChange(e, 'selectionProcess', 'technicalTest')} /> Technical Test
                        </label>
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <input type="checkbox" name="groupDiscussion" checked={formData.selectionProcess.groupDiscussion} onChange={(e) => handleNestedChange(e, 'selectionProcess', 'groupDiscussion')} /> Group Discussion
                        </label>
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <input type="checkbox" name="personalInterview" checked={formData.selectionProcess.personalInterview} onChange={(e) => handleNestedChange(e, 'selectionProcess', 'personalInterview')} /> Personal Interview
                        </label>
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <input type="checkbox" name="provisionForWaitlist" checked={formData.selectionProcess.provisionForWaitlist} onChange={(e) => handleNestedChange(e, 'selectionProcess', 'provisionForWaitlist')} /> Provision for waitlist
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="finalOfferAnnouncement" style={labelStyle}>Final offer/ selection to be announced:</label>
                    <select id="finalOfferAnnouncement" name="finalOfferAnnouncement" value={formData.finalOfferAnnouncement} onChange={handleChange} style={inputStyle}>
                        <option value="">Select Option</option>
                        <option value="Same day">Same day</option>
                        <option value="Later, but no further interviews">Later, but no further interviews</option>
                        <option value="Later, after next stage of interviews">Later, after next stage of interviews</option>
                    </select>
                </div>

                {/* CONTACT INFORMATION */}
                <h3 style={sectionHeaderStyle}>Contact Information</h3>
                <div>
                    <label htmlFor="contactPerson" style={labelStyle}>Contact Person*:</label>
                    <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="emailAddress" style={labelStyle}>E-mail Address*:</label>
                    <input type="email" id="emailAddress" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="contactAddress" style={labelStyle}>Contact Address:</label>
                    <textarea id="contactAddress" name="contactAddress" value={formData.contactAddress} onChange={handleChange} rows="3" style={inputStyle}></textarea>
                </div>
                <div>
                    <label htmlFor="mobileNo" style={labelStyle}>Mobile No:</label>
                    <input type="tel" id="mobileNo" name="mobileNo" value={formData.mobileNo} onChange={handleChange} style={inputStyle} />
                </div>

                {/* SIGNATURE */}
                <h3 style={sectionHeaderStyle}>Signature Details</h3>
                <div>
                    <label htmlFor="signatureName" style={labelStyle}>Name:</label>
                    <input type="text" id="signatureName" name="signatureName" value={formData.signatureName} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                    <label htmlFor="signatureDesignation" style={labelStyle}>Designation:</label>
                    <input type="text" id="signatureDesignation" name="signatureDesignation" value={formData.signatureDesignation} onChange={handleChange} style={inputStyle} />
                </div>


                {message && (
                    <p style={{ color: isError ? 'red' : 'green', textAlign: 'center', marginTop: '15px' }}>
                        {message}
                    </p>
                )}

                <button type="submit" disabled={loading} style={{ padding: '12px 25px', fontSize: '1.1em', backgroundColor: loading ? '#007bff99' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px' }}>
                    {loading ? 'Submitting...' : 'Submit Internship Post'}
                </button>
            </form>
        </div>
    );
}