import React, { useCallback, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
    FaSearch,
    FaPlus,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaUser,
    FaTimes,
    FaCheckCircle,
    FaExclamationCircle,
    FaCrop
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axiosWrapper from "../../utils/AxiosWrapper";
import { User } from "../../Context/UserContext";

const LostAndFound = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [showReportModal, setShowReportModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = User();
    // Image cropping states
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const [croppedImageFile, setCroppedImageFile] = useState(null);
    const categories = ["All", "Electronics", "Books", "Clothing", "Accessories", "Documents", "Other"];
    const [reportForm, setReportForm] = useState({
        itemName: "",
        category: "Electronics",
        description: "",
        dateLost: "",
        locationLost: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        imageUrl: ""
    });

    const [claimForm, setClaimForm] = useState({
        claimerName: "",
        claimerEmail: "",
        claimerPhone: "",
        proofDescription: "",
        additionalDetails: ""
    });

    const fetchItems = useCallback(async () => { 
        const response = await axiosWrapper.get('/student/items');
        console.log("Fetched items:", response.data.data);
        setItems(response.data.data);
    }, []);

    const filterItems = useCallback(() => {
        let filtered = items;

        if (filterCategory !== "all") {
            filtered = filtered.filter(
                item => item.category.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        if (searchQuery) {
            filtered = filtered.filter(
                item =>
                    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.locationLost.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [items, searchQuery, filterCategory]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        filterItems();
    }, [filterItems]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();

        if (!reportForm.itemName || !reportForm.description || !reportForm.dateLost || !reportForm.locationLost) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
                        const formData = new FormData();
                        formData.append("reporterId", user.id);
                        formData.append("itemName", reportForm.itemName);
                        formData.append("category", reportForm.category);
                        formData.append("description", reportForm.description);
                        formData.append("dateLost", reportForm.dateLost);
                        formData.append("locationLost", reportForm.locationLost);
                        formData.append("status", "lost");
                        formData.append("reportedBy", reportForm.contactName || "Anonymous");
                        formData.append("contactEmail", reportForm.contactEmail || "");
                        formData.append("contactPhone", reportForm.contactPhone || "");
                        if (croppedImageFile) {
                            formData.append("image", croppedImageFile);
                        }

                        const resp = await axiosWrapper.post(`/student/lost-and-found/report`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });

                        const createdItem = resp.data?.data;
                        if (!createdItem) {
                            toast.error(resp.data?.message || "Failed to report item");
                            return;
                        }

                        setItems((prev) => [createdItem, ...prev]);
            toast.success("Item reported successfully!");
            setShowReportModal(false);
            setReportForm({
                itemName: "",
                category: "Electronics",
                description: "",
                dateLost: "",
                locationLost: "",
                contactName: "",
                contactPhone: "",
                contactEmail: "",
                imageUrl: ""
            });
                        setCroppedImageFile(null);
            fetchItems();
        } catch (error) {
            toast.error("Failed to report item");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();

        if (!claimForm.claimerName || !claimForm.claimerEmail || !claimForm.proofDescription) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const resp = await axiosWrapper.post(
                `/student/lost-and-found/claim/${selectedItem._id || selectedItem.id}`,
                {
                    claimerName: claimForm.claimerName,
                    claimerEmail: claimForm.claimerEmail,
                    claimerPhone: claimForm.claimerPhone,
                    proofDescription: claimForm.proofDescription,
                    additionalDetails: claimForm.additionalDetails,
                }
            );

            toast.success(resp.data?.message || "Claim request submitted successfully! The reporter will be notified.");
            setShowClaimModal(false);
            setClaimForm({
                claimerName: "",
                claimerEmail: "",
                claimerPhone: "",
                proofDescription: "",
                additionalDetails: ""
            });
            setSelectedItem(null);
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit claim");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkClaimed = async (item) => {
        setIsLoading(true);
        try {
            const resp = await axiosWrapper.patch(`/student/lost-and-found/mark-claimed/${item._id || item.id}`);
            toast.success(resp.data?.message || "Item marked as claimed");
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark claimed");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaimClick = (item) => {
        setSelectedItem(item);
        setShowClaimModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Lost & Found</h1>
                    <p className="text-slate-400">Report lost items or claim found items</p>
                </div>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    <FaPlus />
                    Report Lost Item
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-700">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by item name, description, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <MdCategory className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat.toLowerCase()}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <FaExclamationCircle className="text-5xl text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">No items found</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item._id || item.id}
                            className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl flex flex-col h-full"
                        >
                            {/* Image Section */}
                            <div className="w-full h-56 overflow-hidden bg-dark-700 flex-shrink-0">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.itemName}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <FaExclamationCircle className="text-5xl text-slate-600 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">No image available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-xl font-bold text-white mb-2 truncate">{item.itemName}</h3>
                                        <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {item.status === "claimed" ? (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium whitespace-nowrap">
                                                <FaCheckCircle /> Claimed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium whitespace-nowrap">
                                                Unclaimed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-slate-300 mb-4 line-clamp-3 flex-grow">{item.description}</p>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <FaMapMarkerAlt className="text-primary-500 flex-shrink-0" />
                                        <span className="truncate">{item.locationLost}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <FaCalendarAlt className="text-primary-500 flex-shrink-0" />
                                        <span>{new Date(item.dateLost).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <FaUser className="text-primary-500 flex-shrink-0" />
                                        <span className="truncate">Reported by {item.reportedBy}</span>
                                    </div>
                                </div>

                                {item.status !== "claimed" && (
                                    <div className="mt-auto space-y-3">
                                        {String(item.reporterId) === String(user?.id) ? (
                                            <button
                                                onClick={() => handleMarkClaimed(item)}
                                                disabled={isLoading}
                                                className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                                            >
                                                Mark Claimed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleClaimClick(item)}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-semibold transition-all duration-300"
                                            >
                                                Claim This Item
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Report Item Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Report Lost Item</h2>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-slate-400 text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={reportForm.itemName}
                                    onChange={(e) => setReportForm({ ...reportForm, itemName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                    placeholder="e.g., iPhone 13 Pro"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={reportForm.category}
                                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                    required
                                >
                                    {categories.filter(cat => cat !== "All").map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 min-h-[100px]"
                                    placeholder="Provide detailed description of the lost item..."
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">
                                        Date Lost <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={reportForm.dateLost}
                                        onChange={(e) => setReportForm({ ...reportForm, dateLost: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">
                                        Location Lost <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={reportForm.locationLost}
                                        onChange={(e) => setReportForm({ ...reportForm, locationLost: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                        placeholder="e.g., Library 3rd Floor"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Contact Name</label>
                                <input
                                    type="text"
                                    value={reportForm.contactName}
                                    onChange={(e) => setReportForm({ ...reportForm, contactName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={reportForm.contactPhone}
                                        onChange={(e) => setReportForm({ ...reportForm, contactPhone: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                        placeholder="+1-555-0123"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        value={reportForm.contactEmail}
                                        onChange={(e) => setReportForm({ ...reportForm, contactEmail: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                        placeholder="your.email@college.edu"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Upload Image
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error("File size should be less than 5MB");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImageToCrop(reader.result);
                                                    setShowCropModal(true);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 file:cursor-pointer focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                {reportForm.imageUrl && (
                                    <div className="mt-4 relative">
                                        <img
                                            src={reportForm.imageUrl}
                                            alt="Preview"
                                            className="w-full max-w-xs h-48 object-cover rounded-xl border border-dark-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReportForm({ ...reportForm, imageUrl: "" });
                                                setCroppedImageFile(null);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                        >
                                            <FaTimes className="text-white" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-slate-500 text-xs mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Submitting..." : "Report Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Crop Modal */}
            {showCropModal && imageToCrop && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-dark-700">
                        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <FaCrop className="text-primary-500 text-xl" />
                                <h2 className="text-2xl font-bold text-white">Crop Image</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCropModal(false);
                                    setImageToCrop(null);
                                    setCrop(undefined);
                                    setCompletedCrop(null);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-dark-900 rounded-xl p-4 mb-6">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={4 / 3}
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageToCrop}
                                        alt="Crop"
                                        className="max-w-full h-auto"
                                        onLoad={(e) => {
                                            const { width, height } = e.currentTarget;
                                            const nextCrop = centerCrop(
                                                makeAspectCrop({ unit: "%", width: 90 }, 4 / 3, width, height),
                                                width,
                                                height
                                            );
                                            setCrop(nextCrop);
                                        }}
                                    />
                                </ReactCrop>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCropModal(false);
                                        setImageToCrop(null);
                                        setCrop(undefined);
                                        setCompletedCrop(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (completedCrop && imgRef.current) {
                                            const pixelCrop = convertToPixelCrop(
                                                completedCrop,
                                                imgRef.current.width,
                                                imgRef.current.height
                                            );
                                            const canvas = document.createElement("canvas");
                                            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                                            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
                                            canvas.width = Math.max(1, Math.floor(pixelCrop.width));
                                            canvas.height = Math.max(1, Math.floor(pixelCrop.height));
                                            const ctx = canvas.getContext("2d");

                                            ctx.drawImage(
                                                imgRef.current,
                                                pixelCrop.x * scaleX,
                                                pixelCrop.y * scaleY,
                                                pixelCrop.width * scaleX,
                                                pixelCrop.height * scaleY,
                                                0,
                                                0,
                                                pixelCrop.width,
                                                pixelCrop.height
                                            );

                                            canvas.toBlob((blob) => {
                                                if (blob) {
                                                    const file = new File(
                                                      [blob],
                                                      `lost-and-found-${Date.now()}.png`,
                                                      { type: blob.type || "image/png" }
                                                    );
                                                    setCroppedImageFile(file);

                                                    const previewUrl = URL.createObjectURL(blob);
                                                    setReportForm({ ...reportForm, imageUrl: previewUrl });

                                                    setShowCropModal(false);
                                                    setImageToCrop(null);
                                                    setCrop(undefined);
                                                    setCompletedCrop(null);
                                                    toast.success("Image cropped successfully!");
                                                }
                                            });
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-semibold transition-all"
                                >
                                    Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Claim Item Modal */}
            {showClaimModal && selectedItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Claim Item: {selectedItem.itemName}</h2>
                            <button
                                onClick={() => {
                                    setShowClaimModal(false);
                                    setSelectedItem(null);
                                }}
                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-slate-400 text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
                            <div className="bg-dark-700 border border-dark-600 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-white mb-2">Item Details</h3>
                                <p className="text-slate-300 text-sm mb-2">{selectedItem.description}</p>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <FaMapMarkerAlt className="text-primary-500" />
                                    <span>Lost at: {selectedItem.locationLost}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={claimForm.claimerName}
                                    onChange={(e) => setClaimForm({ ...claimForm, claimerName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={claimForm.claimerEmail}
                                        onChange={(e) => setClaimForm({ ...claimForm, claimerEmail: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                        placeholder="your.email@college.edu"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={claimForm.claimerPhone}
                                        onChange={(e) => setClaimForm({ ...claimForm, claimerPhone: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                                        placeholder="+1-555-0123"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">
                                    Proof of Ownership <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={claimForm.proofDescription}
                                    onChange={(e) => setClaimForm({ ...claimForm, proofDescription: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 min-h-[100px]"
                                    placeholder="Describe identifying features, serial numbers, or any proof that this item belongs to you..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Additional Details</label>
                                <textarea
                                    value={claimForm.additionalDetails}
                                    onChange={(e) => setClaimForm({ ...claimForm, additionalDetails: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 min-h-[80px]"
                                    placeholder="Any additional information..."
                                />
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <p className="text-yellow-400 text-sm">
                                    <strong>Note:</strong> The person who reported this item will be notified of your claim.
                                    They will contact you directly to verify ownership and arrange item return.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowClaimModal(false);
                                        setSelectedItem(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Submitting..." : "Submit Claim"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LostAndFound;
