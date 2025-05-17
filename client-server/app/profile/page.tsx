"use client";

import { Case, UserProfile } from "@/types/globals";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CaseRow } from "../components/CaseRow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function ProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/profile?userid=${userId}`);
        const json = await res.json();
        setUserData(json.data);

        const casesRes = await fetch(`/api/cases?userid=${userId}`);
        const casesJson = await casesRes.json();
        setCases(casesJson.data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !userData) return;

    try {
      const res = await fetch(`/api/profile?userid=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error("Update failed:", result.error);
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleNewCase = () => {
    router.push("/create");
  };

  if (!userId) {
    return (
      <p className="text-gray-600 text-sm">No user ID provided in the URL.</p>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-r-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-50 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b">
            <div className="relative">
              <img
                src={userData?.image || ""}
                alt={userData?.name || "Profile"}
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-200"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {userData?.name}
              </h2>
              <p className="text-gray-500">{userData?.email}</p>
              <p className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-block mt-2">
                {userData?.role}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                Edit Profile
              </h3>

              <div className="space-y-4 max-w-md">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={userData?.name || ""}
                      onChange={(e) =>
                        userData &&
                        setUserData({ ...userData, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={userData?.age || ""}
                      onChange={(e) =>
                        userData &&
                        setUserData({
                          ...userData,
                          age: e.target.value ? +e.target.value : null,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={userData?.gender || ""}
                    onChange={(e) =>
                      userData &&
                      setUserData({ ...userData, gender: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Cases
                </h3>
                <Button
                  onClick={handleNewCase}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  New case
                </Button>
              </div>

              <div className="bg-white rounded-lg border">
                <div className="divide-y divide-gray-200">
                  {cases.length > 0 ? (
                    cases.map((caseItem) => (
                      <CaseRow key={caseItem.id} caseItem={caseItem} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No cases found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-10 text-gray-600">
          Loading profile page...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
