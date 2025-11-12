import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { questionnaireService } from '../services/questionnaireService';

const QuestionnairesPage = () => {
  const navigate = useNavigate();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    description: '',
    standard: ''
  });

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await questionnaireService.getAllQuestionnaires();
      
      if (response.success) {
        setQuestionnaires(response.data || []);
      } else {
        setError('Gagal memuat questionnaires');
      }
    } catch (err) {
      console.error('Error loading questionnaires:', err);
      setError(err.message || 'Gagal memuat questionnaires dari server');
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateQuestionnaire = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Judul tidak boleh kosong');
      }

      const questionnaireData = {
        title: formData.title.trim(),
        version: formData.version.trim() || null,
        description: formData.description.trim() || null,
        standard: formData.standard.trim() || null
      };

      const response = await questionnaireService.createQuestionnaire(questionnaireData);
      
      if (response.success) {
        setSuccess('Questionnaire berhasil dibuat!');
        setFormData({ title: '', version: '', description: '', standard: '' });
        setShowCreateModal(false);
        await loadQuestionnaires();
      } else {
        throw new Error(response.message || 'Gagal membuat questionnaire');
      }
    } catch (err) {
      console.error('Error creating questionnaire:', err);
      setError(err.message || 'Terjadi kesalahan saat membuat questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestionnaire = async (id, title) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus questionnaire "${title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await questionnaireService.deleteQuestionnaire(id);
      
      if (response.success) {
        setSuccess('Questionnaire berhasil dihapus');
        await loadQuestionnaires();
      } else {
        throw new Error(response.message || 'Gagal menghapus questionnaire');
      }
    } catch (err) {
      console.error('Error deleting questionnaire:', err);
      setError(err.message || 'Terjadi kesalahan saat menghapus questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestions = (id) => {
    navigate(`/edit-questionnaire/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-raimes-purple mb-2">
                Questionnaires
              </h1>
              <p className="text-gray-600">
                Kelola kuesioner assessment untuk perusahaan pertambangan
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-raimes-purple hover:bg-opacity-90 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Questionnaire Baru
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Questionnaires Grid */}
          {loading && questionnaires.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
            </div>
          ) : questionnaires.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada questionnaire</h3>
              <p className="text-gray-500 mb-4">Buat questionnaire pertama Anda untuk memulai</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-raimes-purple hover:bg-opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Buat Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionnaires.map((questionnaire) => (
                <div
                  key={questionnaire.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-raimes-purple mb-2">
                        {questionnaire.title}
                      </h3>
                      {questionnaire.version && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          v{questionnaire.version}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteQuestionnaire(questionnaire.id, questionnaire.title)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {questionnaire.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {questionnaire.description}
                    </p>
                  )}

                  {questionnaire.standard && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {questionnaire.standard}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{questionnaire.question_count || 0} Pertanyaan</span>
                    </div>

                    <button
                      onClick={() => handleEditQuestions(questionnaire.id)}
                      className="bg-raimes-yellow hover:bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Edit Pertanyaan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Questionnaire Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 animate-fadeIn" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-raimes-purple">
                Buat Questionnaire Baru
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateQuestionnaire}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Questionnaire *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                    placeholder="e.g., Assessment AI Mining 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versi
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                    placeholder="e.g., 1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard
                  </label>
                  <input
                    type="text"
                    name="standard"
                    value={formData.standard}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                    placeholder="e.g., ISO 14001, PROPER"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent resize-none"
                    placeholder="Deskripsi singkat tentang questionnaire ini..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-raimes-purple hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Membuat...' : 'Buat Questionnaire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnairesPage;
