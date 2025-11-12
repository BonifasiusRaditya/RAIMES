import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { questionService } from '../services/questionService';
import { questionnaireService } from '../services/questionnaireService';

const EditQuestionnaire = () => {
  const navigate = useNavigate();
  const { id: questionnaireID } = useParams(); // Get questionnaireID from route params

  // State untuk questionnaire info
  const [questionnaire, setQuestionnaire] = useState(null);

  // State untuk form
  const [formData, setFormData] = useState({
    text: '',
    type: 'essay',
    weight: 1,
    category: '',
    requireEvidence: false,
    options: ['', ''], // Minimal 2 opsi untuk multiple choice
    editingId: null // For tracking if we're editing
  });

  // State untuk daftar pertanyaan
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load questionnaire info and questions on component mount
  useEffect(() => {
    if (!questionnaireID) {
      setError('Questionnaire ID tidak ditemukan');
      return;
    }
    loadQuestionnaireInfo();
    loadQuestions();
  }, [questionnaireID]);

  // Reload questions when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (questionnaireID) {
        loadQuestions();
      }
    }, 500); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterCategory, questionnaireID]);

  // Load questionnaire info
  const loadQuestionnaireInfo = async () => {
    try {
      const response = await questionnaireService.getQuestionnaireById(questionnaireID);
      if (response.success) {
        setQuestionnaire(response.data);
      }
    } catch (err) {
      console.error('Error loading questionnaire:', err);
      setError('Gagal memuat info questionnaire');
    }
  };

  // Load questions from API
  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('🔄 Loading questions with filters:', { 
        questionnaireID,
        category: filterCategory, 
        search: searchTerm 
      });
      
      // First test backend connection
      try {
        await questionService.testConnection();
        console.log('✅ Backend connection successful');
      } catch (connectionError) {
        console.error('❌ Backend connection failed:', connectionError);
        throw new Error('Backend server tidak dapat diakses. Pastikan server berjalan di http://localhost:3000');
      }
      
      // Then fetch questions (filtered by questionnaireID)
      const response = await questionService.getAllQuestions({
        category: filterCategory === 'all' ? null : filterCategory,
        search: searchTerm
      });
      
      console.log('📊 API Response:', response);
      
      if (response.success) {
        // Filter questions by questionnaireID on client side
        const filteredQuestions = (response.data || []).filter(
          q => String(q.questionnaireID) === String(questionnaireID)
        );
        setQuestions(filteredQuestions);
        console.log(`✅ Loaded ${filteredQuestions.length} questions for questionnaire ${questionnaireID}`);
      } else {
        setError('Gagal memuat pertanyaan: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError(err.message || 'Gagal memuat pertanyaan dari server');
      setQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle type change
  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      options: type === 'multiple_choice' ? ['', ''] : []
    }));
  };

  // Handle option changes
  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Add new option
  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  // Remove option
  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.text.trim()) {
        throw new Error('Pertanyaan tidak boleh kosong');
      }
      if (!formData.category.trim()) {
        throw new Error('Kategori tidak boleh kosong');
      }
      if (formData.type === 'multiple_choice') {
        const validOptions = formData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          throw new Error('Minimal harus ada 2 opsi untuk pertanyaan pilihan ganda');
        }
      }

      // Prepare data for API
      const questionData = {
        questionnaireID: Number(questionnaireID), // Auto-populated from route params
        text: formData.text.trim(),
        type: formData.type,
        weight: parseInt(formData.weight),
        category: formData.category.trim(),
        require_evidence: formData.requireEvidence,
        options: formData.type === 'multiple_choice' 
          ? formData.options.filter(opt => opt.trim() !== '')
          : null
      };

      let response;
      if (formData.editingId) {
        // Update existing question
        response = await questionService.updateQuestion(formData.editingId, questionData);
      } else {
        // Create new question
        response = await questionService.createQuestion(questionData);
      }
      
      if (response.success) {
        setSuccess(formData.editingId 
          ? 'Pertanyaan berhasil diperbarui!' 
          : 'Pertanyaan berhasil ditambahkan!'
        );
        
        // Reset form
        setFormData({
          text: '',
          type: 'essay', 
          weight: 1,
          category: '',
          requireEvidence: false,
          options: ['', ''],
          editingId: null
        });

        // Reload questions
        await loadQuestions();
      } else {
        throw new Error(response.message || 'Gagal menyimpan pertanyaan');
      }

            questionnaireID: formData.questionnaireID ? Number(formData.questionnaireID) : null,
      console.error('Error submitting question:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(questions.map(q => q.category))];

  // Handle delete question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      return;
    }

    try {
      const response = await questionService.deleteQuestion(id);
      
      if (response.success) {
        setSuccess('Pertanyaan berhasil dihapus');
        await loadQuestions();
        
        // Clear selected question if it was deleted
        if (selectedQuestion?.id === id) {
          setSelectedQuestion(null);
        }
      } else {
        throw new Error(response.message || 'Gagal menghapus pertanyaan');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.message || 'Terjadi kesalahan saat menghapus pertanyaan');
    }
  };

  // Handle edit question
  const handleEditQuestion = (question) => {

    setFormData({
      text: question.text,
      type: question.type,
      weight: question.weight,
      category: question.category,
      requireEvidence: question.require_evidence,
      options: question.type === 'multiple_choice' && question.options
        ? [...question.options, '', ''].slice(0, Math.max(question.options.length, 2))
        : ['', '']
    });

    // Store the ID for editing
    setFormData(prev => ({ ...prev, editingId: question.id }));
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/questionnaires')}
                className="text-gray-600 hover:text-raimes-purple transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-raimes-purple mb-1">
                  {questionnaire?.title || 'Edit Questionnaire'}
                </h1>
                {questionnaire && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {questionnaire.version && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                        v{questionnaire.version}
                      </span>
                    )}
                    {questionnaire.standard && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {questionnaire.standard}
                      </span>
                    )}
                    <span>{questionnaire.question_count || 0} Pertanyaan</span>
                  </div>
                )}
              </div>
            </div>
            {questionnaire?.description && (
              <p className="text-gray-600">
                {questionnaire.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-raimes-purple mb-6">
                  {formData.editingId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                </h2>

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

                <form onSubmit={handleSubmit}>
                  {/* Question Text */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan *
                    </label>
                    <textarea
                      name="text"
                      value={formData.text}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent resize-none"
                      placeholder="Masukkan pertanyaan assessment..."
                      required
                    />
                  </div>

                  {/* Question Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipe Pertanyaan *
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleTypeChange('essay')}
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
                          formData.type === 'essay'
                            ? 'border-raimes-purple bg-raimes-purple text-white'
                            : 'border-gray-300 text-gray-700 hover:border-raimes-purple'
                        }`}
                      >
                        Essay
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('multiple_choice')}
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
                          formData.type === 'multiple_choice'
                            ? 'border-raimes-purple bg-raimes-purple text-white'
                            : 'border-gray-300 text-gray-700 hover:border-raimes-purple'
                        }`}
                      >
                        Pilihan Ganda
                      </button>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {formData.type === 'multiple_choice' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Opsi Jawaban
                      </label>
                      <div className="space-y-3">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                              placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
                            />
                            {formData.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="shrink-0 w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.options.length < 6 && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="flex items-center gap-2 px-4 py-2 text-raimes-purple hover:bg-raimes-purple hover:text-white border border-raimes-purple rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Opsi
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category and Weight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                        placeholder="e.g., Environmental, Safety, Social"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bobot
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Require Evidence */}
                  <div className="mb-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requireEvidence"
                        checked={formData.requireEvidence}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-raimes-purple border-gray-300 rounded focus:ring-raimes-purple"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Memerlukan bukti (upload file)
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    {formData.editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            text: '',
                            type: 'essay',
                            weight: 1,
                            category: '',
                            requireEvidence: false,
                            options: ['', ''],
                            editingId: null
                          });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-raimes-purple hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {formData.editingId ? 'Menyimpan...' : 'Menyimpan...'}
                        </>
                      ) : (
                        formData.editingId ? 'Update Pertanyaan' : 'Simpan Pertanyaan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Questions List Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-raimes-purple mb-4">
                  Daftar Pertanyaan
                </h2>

                {/* Search and Filter */}
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari pertanyaan..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent text-sm"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => setSelectedQuestion(question)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedQuestion?.id === question.id
                          ? 'border-raimes-purple bg-raimes-purple bg-opacity-5'
                          : 'border-gray-200 hover:border-raimes-purple'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          question.type === 'essay'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === 'essay' ? 'Essay' : 'PG'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Bobot: {question.weight}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {question.text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{question.category}</span>
                        {question.requireEvidence && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Bukti
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Tidak ada pertanyaan ditemukan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Detail Modal/Panel */}
              {selectedQuestion && (
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-raimes-purple">
                      Detail Pertanyaan
                    </h3>
                    <button
                      onClick={() => setSelectedQuestion(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Pertanyaan
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedQuestion.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Tipe
                        </label>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          selectedQuestion.type === 'essay'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedQuestion.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Bobot
                        </label>
                        <p className="text-sm font-semibold text-raimes-purple">
                          {selectedQuestion.weight}/10
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Kategori
                      </label>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {selectedQuestion.category}
                      </span>
                    </div>

                    {selectedQuestion.options && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Opsi Jawaban
                        </label>
                        <div className="space-y-2">
                          {selectedQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <span className="shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-sm text-gray-900">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Memerlukan Bukti
                      </label>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        selectedQuestion.requireEvidence
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedQuestion.requireEvidence ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Ya, perlu upload file
                          </>
                        ) : (
                          'Tidak perlu bukti'
                        )}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditQuestion(selectedQuestion)}
                          className="flex-1 bg-raimes-yellow hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Edit Pertanyaan
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditQuestionnaire;
