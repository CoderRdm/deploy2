
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"

export default function PlacementStatsDisplay() {
  const placementData = [
    { year: "2019", placed: 85, companies: 120, highestPackage: 45, averagePackage: 12 },
    { year: "2020", placed: 88, companies: 135, highestPackage: 48, averagePackage: 14 },
    { year: "2021", placed: 92, companies: 150, highestPackage: 52, averagePackage: 16 },
    { year: "2022", placed: 95, companies: 165, highestPackage: 56, averagePackage: 18 },
    { year: "2023", placed: 97, companies: 180, highestPackage: 60, averagePackage: 20 },
  ]

  const departmentData = [
    { name: "Computer Science", value: 98 },
    { name: "Electronics", value: 95 },
    { name: "Electrical", value: 92 },
    { name: "Mechanical", value: 88 },
    { name: "Civil", value: 85 },
    { name: "Chemical", value: 82 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"] // These are specific to charts, can remain as is or be themed if desired via chartConfig

  const barChartData = placementData.map((item) => ({
    year: item.year,
    "Placement %": item.placed,
  }))

  const companyChartData = placementData.map((item) => ({
    year: item.year,
    "Companies Visited": item.companies,
  }))

  const packageChartData = placementData.map((item) => ({
    year: item.year,
    "Highest Package (LPA)": item.highestPackage,
    "Average Package (LPA)": item.averagePackage,
  }))

  const chartConfig = {
    "Placement %": {
      label: "Placement %",
      color: "hsl(var(--chart-1))",
    },
    "Companies Visited": {
      label: "Companies Visited",
      color: "hsl(var(--chart-2))",
    },
    "Highest Package (LPA)": {
      label: "Highest Package (LPA)",
      color: "hsl(var(--chart-1))",
    },
    "Average Package (LPA)": {
      label: "Average Package (LPA)",
      color: "hsl(var(--chart-2))",
    },
    "Computer Science": { label: "CS", color: COLORS[0] },
    "Electronics": { label: "ECE", color: COLORS[1] },
    "Electrical": { label: "EE", color: COLORS[2] },
    "Mechanical": { label: "ME", color: COLORS[3] },
    "Civil": { label: "Civil", color: COLORS[4] },
    "Chemical": { label: "Chemical", color: COLORS[5] },
  }

  return (
    <section id="stats" className="bg-background py-16"> {/* Use bg-background */}
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Placement Statistics</h2> {/* Use text-primary */}
          <p className="mx-auto max-w-3xl text-muted-foreground"> {/* Use text-muted-foreground */}
            Our placement records showcase the success of our students and the trust companies place in MNIT Jaipur
            talent.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">97%</CardTitle> {/* Use text-primary */}
              <CardDescription>Placement Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Overall placement rate for 2023 batch</p> {/* Use text-muted-foreground */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">180+</CardTitle> {/* Use text-primary */}
              <CardDescription>Companies Visited</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Top recruiters from various sectors</p> {/* Use text-muted-foreground */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">₹60 LPA</CardTitle> {/* Use text-primary */}
              <CardDescription>Highest Package</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Highest package offered in 2023</p> {/* Use text-muted-foreground */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">₹20 LPA</CardTitle> {/* Use text-primary */}
              <CardDescription>Average Package</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Average package for 2023 batch</p> {/* Use text-muted-foreground */}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="placement" className="mx-auto max-w-3xl">
          <div className="mb-8 flex justify-center">
            <TabsList>
              <TabsTrigger className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize" value="placement">Placement %</TabsTrigger> {/* Use text-primary and active state changes */}
              <TabsTrigger className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize" value="companies">Companies Visited</TabsTrigger>
              <TabsTrigger className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize" value="packages">Package Trends</TabsTrigger>
              <TabsTrigger className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize" value="departments">Department-wise</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="placement">
            <Card>
              <CardHeader>
                <CardTitle>Placement Percentage (Last 5 Years)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_label, DPs) => DPs?.[0]?.payload.year}
                          formatter={(value, name) => (
                            <p className="text-sm">
                              {name}: <span className="font-mono font-medium text-foreground">{value}%</span>
                            </p>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="Placement %" fill="var(--color-Placement %)" radius={4} />
                    <ChartLegend />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Companies Visited (Last 5 Years)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={companyChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_label, DPs) => DPs?.[0]?.payload.year}
                          formatter={(value, name) => (
                            <p className="text-sm">
                              {name}: <span className="font-mono font-medium text-foreground">{value}</span>
                            </p>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="Companies Visited" fill="var(--color-Companies Visited)" radius={4} />
                    <ChartLegend />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Package Trends (Last 5 Years)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={packageChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${value}L`} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_label, DPs) => DPs?.[0]?.payload.year}
                          formatter={(value, name) => (
                            <p className="text-sm">
                              {name}: <span className="font-mono font-medium text-foreground">₹{value} LPA</span>
                            </p>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="Highest Package (LPA)" fill="var(--color-Highest Package (LPA))" radius={4} />
                    <Bar dataKey="Average Package (LPA)" fill="var(--color-Average Package (LPA))" radius={4} />
                    <ChartLegend />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Placement % (2023)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <ChartTooltip
                       cursor={false}
                       content={
                        <ChartTooltipContent
                          formatter={(value, name, props) => (
                            <div className="text-sm">
                              <div className="mb-0.5 font-medium text-foreground">{props.payload?.name}</div> {/* Updated to props.payload.name */}
                              <p className="text-muted-foreground">
                                Placement: <span className="font-mono font-medium text-foreground">{value}%</span>
                              </p>
                            </div>
                          )}
                          hideLabel={true} 
                          indicator="dot"
                        />
                      }
                    />
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`} // Added nullish coalescing for percent
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartLegend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}