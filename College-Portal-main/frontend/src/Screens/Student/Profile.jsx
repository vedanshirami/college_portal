import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";

const Profile = ({ profileData }) => {
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex items-center gap-8 mb-12 border-b border-dark-700 pb-8 justify-between">
        <div className="flex items-center gap-8">
          <img
            src={`${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover ring-4 ring-primary-400 ring-offset-4 ring-offset-dark-900"
          />
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">
              {`${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`}
            </h1>
            <p className="text-lg text-gray-600 mb-1">
              {profileData.enrollmentNo}
            </p>
            <p className="text-lg text-blue-600 font-medium">
              {profileData.branchId.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8 justify-end">
          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
          >
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
        {showPasswordUpdate && (
          <UpdatePasswordLoggedIn
            onClose={() => setShowPasswordUpdate(false)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Personal Information */}
        <div className="bg-dark-800 rounded-2xl shadow-md border border-dark-700 p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 pb-2 border-b border-dark-700">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400">Email</label>
              <p className="text-slate-100">{profileData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Phone</label>
              <p className="text-slate-100">{profileData.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Gender
              </label>
              <p className="text-slate-100 capitalize">{profileData.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Blood Group
              </label>
              <p className="text-slate-100">{profileData.bloodGroup}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Date of Birth
              </label>
              <p className="text-slate-100">{formatDate(profileData.dob)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Semester
              </label>
              <p className="text-slate-100">{profileData.semester}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-dark-800 rounded-2xl shadow-md border border-dark-700 p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 pb-2 border-b border-dark-700">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400">
                Address
              </label>
              <p className="text-slate-100">{profileData.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">City</label>
              <p className="text-slate-100">{profileData.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">State</label>
              <p className="text-slate-100">{profileData.state}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Pincode
              </label>
              <p className="text-slate-100">{profileData.pincode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Country
              </label>
              <p className="text-slate-100">{profileData.country}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-dark-800 rounded-2xl shadow-md border border-dark-700 p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 pb-2 border-b border-dark-700">
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400">Name</label>
              <p className="text-slate-100">
                {profileData.emergencyContact.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                Relationship
              </label>
              <p className="text-slate-100">
                {profileData.emergencyContact.relationship}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Phone</label>
              <p className="text-slate-100">
                {profileData.emergencyContact.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
