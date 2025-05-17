"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { auth } from "@clerk/nextjs/server";
import { HeartPulse, ClipboardList, MessageSquare, Activity, Calendar, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const HomePage =  () => {
    const navigate = useRouter()
     const {userId} = useAuth()
// const { userId } = await auth()
  return (
    <div className="flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <HeartPulse className="h-10 w-10 text-purple-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900">
              SnapAid
            </h1>
          </div>
          <p className="text-xl text-gray-600 md:max-w-2xl mb-8">
            AI-powered triage for patients. Get quick assessments and connect
            with healthcare professionals when you need them most.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate.push("/create")}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              New Health Concern
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-purple-200"
              onClick={() => navigate.push("/chat")}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat with AI
            </Button>
          </div>
        </section>

        <Tabs defaultValue="quickAccess" className="mb-12">
          <TabsList className="grid w-full grid-cols-1 md:w-[400px]">
            <TabsTrigger value="quickAccess">Quick Access</TabsTrigger>
            {/* <TabsTrigger value="resources">Resources</TabsTrigger> */}
          </TabsList>
          <TabsContent value="quickAccess" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-purple-500" />
                    Your Concerns
                  </CardTitle>
                  <CardDescription>
                    View and manage your health concerns
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-600"
                    onClick={() => navigate.push(`/profile?user=${userId}`)}
                  >
                    Go to your concerns
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-purple-500" />
                    All Concerns
                  </CardTitle>
                  <CardDescription>
                    Review all patient concerns (Doctor access)
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-600"
                    onClick={() => navigate.push("/all")}
                  >
                    View all concerns
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
                    Chat Support
                  </CardTitle>
                  <CardDescription>
                    Get instant AI-powered health guidance
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-600"
                    onClick={() => navigate.push("/chat")}
                  >
                    Start a chat
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HeartPulse className="mr-2 h-5 w-5 text-red-500" />
                    Emergency Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-2">
                    Get immediate help for emergency situations.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                      Call emergency services: 911
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                      Crisis text line: Text HOME to 741741
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-green-500" />
                    Health Guides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-2">
                    Access helpful information for common conditions.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-green-600"
                    >
                      COVID-19 Guidelines
                    </Button>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-green-600 block"
                    >
                      Mental Health Resources
                    </Button>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-green-600 block"
                    >
                      Preventive Care Tips
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <section className="bg-purple-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-purple-900 mb-4 flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-purple-600" />
            How SnapAid Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-medium mb-2">Describe Your Concern</h3>
              <p className="text-gray-500 text-sm">
                Share your symptoms or health concerns securely through our
                platform.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-medium mb-2">AI Assessment</h3>
              <p className="text-gray-500 text-sm">
                Our AI analyzes your symptoms and provides initial guidance and
                triage recommendations.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-medium mb-2">Professional Care</h3>
              <p className="text-gray-500 text-sm">
                Get connected with the right healthcare providers based on your
                assessment.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
