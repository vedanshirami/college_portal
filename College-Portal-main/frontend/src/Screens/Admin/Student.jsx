import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import { CgDanger } from "react-icons/cg";

const Student = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    semester: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userToken = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    semester: "",
    branchId: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    profile: "",
    status: "active",
    bloodGroup: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  useEffect(() => {
    getBranchHandler();
  }, []);

  const getBranchHandler = async () => {
    try {
      toast.loading("Loading branches...");
      const response = await axiosWrapper.get(`/branch`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranches([]);
      } else {
        console.error(error);
        toast.error(error.response?.data?.message || "Error fetching branches");
      }
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();

    if (
      !searchParams.enrollmentNo &&
      !searchParams.name &&
      !searchParams.semester &&
      !searchParams.branch
    ) {
      toast.error("Please select at least one filter");
      return;
    }

    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching students...");
    try {
      const response = await axiosWrapper.post(
        `/student/search`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          setStudents([]);
        } else {
          toast.success("Students found!");
          setStudents(response.data.data);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      setStudents([]);
      toast.error(error.response?.data?.message || "Error searching students");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFormInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const addStudentHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Student" : "Adding Student");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "emergencyContact") {
          for (const subKey in formData.emergencyContact) {
            formDataToSend.append(
              `emergencyContact[${subKey}]`,
              formData.emergencyContact[subKey]
            );
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      if (file) {
        formDataToSend.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(
          `/student/${selectedStudentId}`,
          formDataToSend,
          {
            headers,
          }
        );
      } else {
        response = await axiosWrapper.post(
          `/student/register`,
          formDataToSend,
          {
            headers,
          }
        );
      }

      toast.dismiss();
      if (response.data.success) {
        if (!isEditing) {
          toast.success(
            `Student created successfully! Default password: student123`
          );
        } else {
          toast.success(response.data.message);
        }
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const deleteStudentHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedStudentId(id);
  };

  const editStudentHandler = (student) => {
    setFormData({
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      semester: student.semester || "",
      branchId: student.branchId?._id || "",
      gender: student.gender || "",
      dob: student.dob?.split("T")[0] || "",
      address: student.address || "",
      city: student.city || "",
      state: student.state || "",
      pincode: student.pincode || "",
      country: student.country || "",
      profile: student.profile || "",
      status: student.status || "active",
      bloodGroup: student.bloodGroup || "",
      emergencyContact: {
        name: student.emergencyContact?.name || "",
        relationship: student.emergencyContact?.relationship || "",
        phone: student.emergencyContact?.phone || "",
      },
    });
    setSelectedStudentId(student._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Student");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(
        `/student/${selectedStudentId}`,
        {
          headers,
        }
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success("Student has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        searchStudents({ preventDefault: () => {} });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      semester: "",
      branchId: "",
      gender: "",
      dob: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      profile: "",
      status: "active",
      bloodGroup: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    });
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedStudentId(null);
    setFile(null);
  };

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10 px-4">
      <div className="flex justify-between items-center w-full mb-6">
        <Heading title="Student Management" />
        {branches.length > 0 && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-gradient flex items-center gap-2 !py-2 !px-4"
          >
            <IoMdAdd className="text-2xl" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {branches.length > 0 && (
        <div className="my-6 mx-auto w-full">
          <form onSubmit={searchStudents} className="glass-effect p-8 rounded-3xl shadow-xl mb-8 animate-fade-in">
            <h3 className="text-xl font-bold text-primary-300 mb-6">Search Students</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollmentNo"
                  value={searchParams.enrollmentNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl input-glow bg-dark-50/70 text-dark-900 placeholder:text-dark-500 transition-all duration-300"
                  placeholder="Enter enrollment number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl input-glow bg-dark-50/70 text-dark-900 placeholder:text-dark-500 transition-all duration-300"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  value={searchParams.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl input-glow bg-dark-50/70 text-dark-900 transition-all duration-300"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Branch
                </label>
                <select
                  name="branch"
                  value={searchParams.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl input-glow bg-dark-50/70 text-dark-900 transition-all duration-300"
                >
                  <option value="">Select Branch</option>
                  {branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={dataLoading}
                className="btn-gradient min-w-[200px]"
              >
                {dataLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {!hasSearched && (
            <div className="text-center glass-effect p-16 rounded-3xl mx-auto max-w-2xl animate-scale-in">
              <img
                src="/assets/filter.svg"
                alt="Select filters"
                className="w-64 h-64 mb-4 mx-auto opacity-80"
              />
              <p className="text-slate-200 text-lg font-medium">Please select at least one filter to search students</p>
            </div>
          )}

          {hasSearched && students.length === 0 && (
            <NoData title="No students found" />
          )}

          {students && students.length > 0 && (
            <div className="mt-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-primary-300 mb-6">Search Results</h2>
              <div className="bg-dark-800 rounded-2xl overflow-hidden shadow-md border border-dark-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-primary-500 text-white">
                        <th className="px-6 py-4 text-left font-semibold">Profile</th>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">E. No</th>
                        <th className="px-6 py-4 text-left font-semibold">Semester</th>
                        <th className="px-6 py-4 text-left font-semibold">Branch</th>
                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                        <th className="px-6 py-4 text-center font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-800">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-dark-700 transition-colors duration-200 border-b border-dark-700">
                          <td className="px-6 py-4">
                            <img
                              src={`${process.env.REACT_APP_MEDIA_LINK}/${student.profile}`}
                              alt={`${student.firstName}'s profile`}
                              className="w-12 h-12 object-cover rounded-full ring-2 ring-primary-400 shadow-lg"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-100">
                            {student.firstName} {student.middleName}{" "}
                            {student.lastName}
                          </td>
                          <td className="px-6 py-4 text-slate-200">
                            {student.enrollmentNo}
                          </td>
                          <td className="px-6 py-4 text-slate-200">
                            {student.semester}
                          </td>
                          <td className="px-6 py-4 text-slate-200">
                            {student.branchId?.name}
                          </td>
                          <td className="px-6 py-4 text-slate-200">{student.email}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                className="bg-slate-600 hover:bg-slate-700 text-white p-2.5 rounded-lg transition-all duration-200 shadow-md"
                                onClick={() => editStudentHandler(student)}
                              >
                                <MdEdit className="text-lg" />
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg transition-all duration-200 shadow-md"
                                onClick={() => deleteStudentHandler(student._id)}
                              >
                                <MdOutlineDelete className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {branches.length == 0 && (
        <div className="flex justify-center items-center flex-col w-full mt-24">
          <CgDanger className="w-16 h-16 text-yellow-500 mb-4" />
          <p className="text-center text-lg">
            Please add branches before adding a student.
          </p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-effect rounded-3xl p-8 w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-scale-in border-2 border-white/30">
            <button
              onClick={resetForm}
              className="absolute top-6 right-6 text-dark-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-100/50 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
            >
              <IoMdClose className="text-3xl" />
            </button>
            <h2 className="text-3xl font-bold gradient-text mb-8">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addStudentHandler();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFormInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) =>
                      handleFormInputChange("middleName", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleFormInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleFormInputChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      handleFormInputChange("semester", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Branch
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) =>
                      handleFormInputChange("branchId", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches?.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleFormInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      handleFormInputChange("dob", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      handleFormInputChange("bloodGroup", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    accept="image/*"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleFormInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      handleFormInputChange("city", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      handleFormInputChange("state", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) =>
                      handleFormInputChange("pincode", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormInputChange("country", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold gradient-text mb-6 mt-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) =>
                          handleEmergencyContactChange("name", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) =>
                          handleEmergencyContactChange(
                            "relationship",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          handleEmergencyContactChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-dark-700 text-slate-200 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t-2 border-primary-100">
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold">Default login:</span>{" "}
                    <span className="font-bold text-primary-600">
                      {formData.enrollmentNo || "enrollment_no"}@gmail.com
                    </span>
                    <br />
                    <span className="font-semibold">Password:</span>{" "}
                    <span className="font-bold text-accent-600">student123</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-dark-700 hover:bg-dark-600 text-slate-200 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-gradient min-w-[180px]"
                  >
                    {isEditing ? "Update Student" : "Add Student"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this student?"
      />
    </div>
  );
};

export default Student;
