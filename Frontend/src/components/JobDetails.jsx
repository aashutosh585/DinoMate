import {
  FaBuilding,
  FaMapMarkerAlt,
  FaRegBookmark,
  FaBookmark,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { successToast, errorToast, infoToast } from "../utils/toastUtils";
import apiClient from "../api/client";
import clientCache from "../utils/cache";

export default function JobDetails({ job }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      const token = localStorage.getItem("token");
      if (!token || !job) return;

      try {
        const savedJobs = await apiClient.getCached("/user/saved-jobs", {}, { ttl: 2 * 60 * 1000, swr: true });
        if (Array.isArray(savedJobs)) {
          setSaved(savedJobs.some((savedJob) => savedJob.id === job.id));
        }

        const applied = await apiClient.getCached(`/applications/has-applied/${job.id}`, {}, { ttl: 5 * 60 * 1000 });
        setHasApplied(applied);
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };

    fetchStatuses();
  }, [job]);

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handleApply = () => {
    navigate(`/apply/${job.id}`);
  };

  const toggleSave = async () => {
    if (!localStorage.getItem("token")) {
      infoToast("You need to be logged in to save jobs.");
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await apiClient.delete(`/user/unsave-job/${job.id}`);
      } else {
        await apiClient.post(`/user/save-job/${job.id}`);
      }
      clientCache.invalidateNamespace("api:/user/saved-jobs");
      setSaved(!saved);
      successToast(saved ? "Job removed from saved list." : "Job saved successfully!");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message ?? `Failed to ${saved ? "unsave" : "save"} job.`;
      errorToast(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!job)
    return <div className="text-gray-500">Select a job to view details</div>;

  return (
    <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200 w-full">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
      >
        <FaArrowLeft size={12} /> Back
      </button>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-3 md:absolute md:top-4 md:right-4 md:mb-0">
        <button
          onClick={toggleSave}
          disabled={saving}
          className="text-[#6B3F27] hover:text-[#5C3421] transition-colors duration-200 disabled:opacity-50"
          title={saved ? "Unsave job" : "Save job"}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-[#6B3F27] border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <FaBookmark size={20} />
          ) : (
            <FaRegBookmark size={20} />
          )}
        </button>

        {job.jobSource === 'AGGREGATED' && job.externalApplyUrl ? (
          <a
            href={job.externalApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded font-medium bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 transition text-sm shadow-sm"
          >
            <span>Apply on {job.sourcePlatform || "Platform"}</span>
            <span className="text-xs">↗</span>
          </a>
        ) : (
          <button
            onClick={
              hasApplied ? () => navigate("/myjobs?tab=applied") : handleApply
            }
            className={`px-4 py-2 rounded font-medium transition-all duration-200 text-sm ${
              hasApplied
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-emerald-700 hover:bg-emerald-800 text-white"
            }`}
          >
            {hasApplied ? "Applied – View Application" : "Apply on Dino_Mate"}
          </button>
        )}
      </div>

      {/* Job Title & Logo */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded border overflow-hidden bg-gray-100">
          <img
            src={job.profilePicture || "/dinomate.png"}
            alt={job.companyName || "Company Logo"}
            className="w-full h-full object-contain p-1 bg-white"
            onError={(e) => { e.target.onerror = null; e.target.src = '/dinomate.png'; }}
          />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#000000]">{job.title}</h1>
          {job.jobSource === 'AGGREGATED' && (
            <span className="text-xs text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
              <span>🌐</span> Verified Aggregated Listing &bull; {job.sourcePlatform || "150+ Platforms"}
            </span>
          )}
        </div>
      </div>

      {/* Company Info */}
      <p className="text-sm text-gray-700 mb-1 flex items-center">
        <FaBuilding className="mr-2 text-emerald-800" /> {job.companyName}
      </p>
      <p className="text-sm text-gray-600 mb-4 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-emerald-800" /> {job.location}
      </p>

      {/* Job Meta Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.jobSource === 'AGGREGATED' ? (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            🌐 Aggregated &bull; {job.sourcePlatform || "External"}
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <img src="/dinomate.png" alt="" className="w-3.5 h-3.5 object-contain inline-block" /> Dino_Mate Direct
          </span>
        )}
        <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <FaBuilding size={12} /> {job.type}
        </span>
        <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <FaMapMarkerAlt size={12} /> {job.workMode}
        </span>
        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
          Posted: {formatDate(job.postedAt)}
        </span>
      </div>

      {/* Description */}
      {job.description?.trim() && (
        <div className="mb-6">
          <h2 className="text-black font-semibold text-base mb-1">
            Job Description
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {job.description}
          </p>
        </div>
      )}

      {/* Responsibilities */}
      {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-black  font-semibold text-base mb-1">
            Responsibilities
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-800 leading-relaxed">
            {job.responsibilities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
        <div>
          <h2 className="text-black  font-semibold text-base mb-1">
            Required Skills
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-800 leading-relaxed">
            {job.requiredSkills.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
