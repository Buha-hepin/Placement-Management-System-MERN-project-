import React, { useEffect, useState } from 'react';
import { BookOpen, Eye, Trash2, Upload, X } from 'lucide-react';
import { deletePlacementMaterial, getPlacementMaterials, uploadPlacementMaterial } from '../../services/api.js';

const resolveFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base}${url}`;
};

export default function PlacementMaterialsAdmin() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getPlacementMaterials();
      setMaterials(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      window.appAlert(error.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      window.appAlert('Title is required');
      return;
    }
    if (!file) {
      window.appAlert('Please choose a file');
      return;
    }

    try {
      setUploading(true);
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('material', file);

      await uploadPlacementMaterial(payload);
      setFormData({ title: '', description: '', category: 'General' });
      setFile(null);
      await fetchMaterials();
      window.appAlert('Placement material uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      window.appAlert(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!(await window.appConfirm('Delete this material?'))) return;

    try {
      await deletePlacementMaterial(materialId);
      await fetchMaterials();
    } catch (error) {
      console.error('Delete failed:', error);
      window.appAlert(error.message || 'Delete failed');
    }
  };

  const isPdf = (material) => {
    const mime = String(material?.mimeType || '').toLowerCase();
    const fileName = String(material?.fileName || '').toLowerCase();
    return mime.includes('pdf') || fileName.endsWith('.pdf');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-blue-600" /> Placement Materials
        </h1>
        <p className="text-gray-600 mt-2">Upload and manage materials that students can access.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Material title"
            className="px-4 py-3 rounded-xl border border-gray-200"
          />
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Category"
            className="px-4 py-3 rounded-xl border border-gray-200"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="px-4 py-3 rounded-xl border border-gray-200"
          />
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
          rows="3"
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
        />
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Material'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Uploaded Materials</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No materials uploaded yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {materials.map((material) => (
              <div key={material._id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{material.title}</p>
                  <p className="text-sm text-gray-500">{material.category || 'General'} | {material.fileName}</p>
                  <p className="text-sm text-gray-600 mt-1">{material.description || 'No description added.'}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <a href={resolveFileUrl(material.fileUrl)} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline inline-block">Open file</a>
                    {isPdf(material) && (
                      <button onClick={() => setPreviewMaterial(material)} className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                        <Eye size={14} /> Preview PDF
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(material._id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewMaterial(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{previewMaterial.title}</h3>
                <p className="text-sm text-gray-500">{previewMaterial.fileName}</p>
              </div>
              <button onClick={() => setPreviewMaterial(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <iframe title={previewMaterial.title} src={resolveFileUrl(previewMaterial.fileUrl)} className="w-full h-[calc(85vh-64px)]" />
          </div>
        </div>
      )}
    </div>
  );
}