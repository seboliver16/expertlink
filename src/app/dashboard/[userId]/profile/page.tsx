"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase.config";
import { useUser } from "../../../UserContext";
import { signOut } from "firebase/auth";
import ExperienceModal from "./ExperienceModal";

const ExpertProfilePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [profileData, setProfileData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, "experts", user.linkedinId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleExperienceChange = (formattedExperience: string) => {
    setProfileData({
      ...profileData,
      experience: formattedExperience,
    });
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    try {
      const docRef = doc(db, "experts", user.linkedinId);
      await updateDoc(docRef, profileData);
      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const handleAddSkill = () => {
    setProfileData({
      ...profileData,
      skills: [...(profileData.skills || []), ""],
    });
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = profileData.skills.filter((_: string, i: number) => i !== index);
    setProfileData({
      ...profileData,
      skills: updatedSkills,
    });
  };

  const formatExperience = (experience: string) => {
    const blocks = experience.split("\n\n").filter((block) => block.trim() !== "");
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <div className="ml-6 space-y-4">
          {blocks.map((block, index) => {
            const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
            const title = lines[0] || "";
            const date = lines[1] || "";
            const description = lines.slice(2).join(" ");
            return (
              <div key={index} className="pl-4">
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-gray-700 text-xs">{date}</p>
                {description && <p className="text-gray-600 mt-1 text-xs">{description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-xl font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Divider */}
      <div className="hidden lg:block w-10 bg-white"></div>

      {/* Left Section - Sticky on Desktop */}
      <div className="w-full lg:w-2/5 p-8 text-sm lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-blue-600">Edit Profile</h1>
          <div className="space-x-4">
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-100 transition"
            >
              Save
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-4 rounded-lg border border-gray-500 text-gray-500 hover:bg-gray-100 transition"
            >
              Log Out
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={profileData?.name || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={profileData?.title || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Summary</label>
            <textarea
              name="summary"
              value={profileData?.summary || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Education</label>
            <textarea
              name="education"
              value={profileData?.education || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={profileData?.yearsOfExperience || 0}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Skills</label>
            {profileData?.skills?.map((skill: string, index: number) => (
              <div key={index} className="flex items-center mt-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...profileData.skills];
                    newSkills[index] = e.target.value;
                    setProfileData({ ...profileData, skills: newSkills });
                  }}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="ml-2 text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSkill}
              className="mt-2 text-blue-600 hover:text-blue-900"
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-1 bg-gray-100 mt-8 mb-8"></div>

      {/* Right Section - Scrollable */}
      <div className="w-full lg:w-3/5 p-8 text-sm overflow-y-auto lg:h-screen">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Profile Preview</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Name</h3>
            <p className="text-xs text-gray-700">{profileData?.name}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Title</h3>
            <p className="text-xs text-gray-700">{profileData?.title}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Summary</h3>
            <p className="text-xs text-gray-700">{profileData?.summary}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Education</h3>
            <p className="text-xs text-gray-700">{profileData?.education}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Years of Experience</h3>
            <p className="text-xs text-gray-700">{profileData?.yearsOfExperience}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Skills</h3>
            <ul className="list-disc list-inside text-xs text-gray-700">
              {profileData?.skills?.map((skill: string, index: number) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-4">Experience</h3>
            {formatExperience(profileData?.experience || "")}
            <button
              onClick={() => setIsExperienceModalOpen(true)}
              className="mt-4 py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Edit Experience
            </button>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">LinkedIn URL</h3>
            <p className="text-xs text-blue-600">
              <a
  href={`https://${profileData.linkedinUrl}`}
  target="_blank"
  rel="noopener noreferrer"
>
  {profileData?.linkedinUrl}
</a>

            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-20 bg-white"></div>

      {/* Experience Modal */}
      {isExperienceModalOpen && (
        <ExperienceModal
          experience={profileData.experience}
          onSave={handleExperienceChange}
          onClose={() => setIsExperienceModalOpen(false)}
        />
      )}
    </main>
  );
};

export default ExpertProfilePage;
