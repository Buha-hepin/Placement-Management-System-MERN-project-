import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Eye, FileText, X } from 'lucide-react';
import { getPlacementMaterials } from '../../services/api.js';

const resolveFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base}${url}`;
};

export default function PlacementMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewMaterial, setPreviewMaterial] = useState(null);

  const categories = ['All', ...Array.from(new Set(materials.map((material) => material.category || 'General')))];
  const filteredMaterials = selectedCategory === 'All'
    ? materials
    : materials.filter((material) => (material.category || 'General') === selectedCategory);

  const isPdf = (material) => {
    const mime = String(material?.mimeType || '').toLowerCase();
    const fileName = String(material?.fileName || '').toLowerCase();
    return mime.includes('pdf') || fileName.endsWith('.pdf');
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getPlacementMaterials();
      setMaterials(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch placement materials:', error);
      window.appAlert(error.message || 'Failed to load placement materials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-blue-600" /> Placement Materials
        </h2>
        <p className="text-gray-600 mt-2">Study material uploaded by admin for placement preparation.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">Loading materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">No placement materials uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((material) => (
            <div key={material._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{material.title}</h3>
                  <p className="text-sm text-blue-600 font-semibold mt-1">{material.category || 'General'}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 p-3 rounded-xl"><FileText size={18} /></div>
              </div>
              <p className="text-sm text-gray-600 mt-3 min-h-[40px]">{material.description || 'No description added.'}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{material.fileName}</span>
                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={resolveFileUrl(material.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Download size={16} /> Open Material
                </a>
                {isPdf(material) && (
                  <button
                    onClick={() => setPreviewMaterial(material)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={16} /> Preview PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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