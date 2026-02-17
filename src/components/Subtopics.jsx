import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import SubtopicService from "../entities/subtopic";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiList, FiChevronRight, FiChevronDown, FiPlusCircle, FiActivity, FiLayers, FiTarget } from "react-icons/fi";
import { FaLayerGroup, FaDotCircle, FaRobot, FaMicrochip } from "react-icons/fa";

const Subtopics = ({ userRole }) => {
  const { classId } = useParams();

  const [subtopics, setSubtopics] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingChildTo, setAddingChildTo] = useState(null);
  const [childName, setChildName] = useState("");

  const role = localStorage.getItem("role");

  // Fetch subtopics
  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const res = await SubtopicService.getSubtopicsByClassId(classId);
      setSubtopics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtopics();
  }, [classId]);

  // Build tree structure
  const subtopicTree = useMemo(() => {
    const map = {};
    const tree = [];

    subtopics.forEach((s) => {
      map[s.id] = { ...s, children: [] };
    });

    subtopics.forEach((s) => {
      if (s.parent_id && map[s.parent_id]) {
        map[s.parent_id].children.push(map[s.id]);
      } else {
        tree.push(map[s.id]);
      }
    });

    return tree;
  }, [subtopics]);

  // Toggle expand/collapse
  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Checkbox handlers
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(subtopics.map((s) => s.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Add subtopic
  const handleAdd = async (parentId = null) => {
    const name = parentId ? childName : newSubtopic;
    if (!name.trim()) return;

    try {
      await SubtopicService.createSubtopic({
        class_id: classId,
        subtopic_name: name,
        parent_id: parentId
      });

      if (parentId) {
        setChildName("");
        setAddingChildTo(null);
        if (!expandedIds.includes(parentId)) {
          setExpandedIds([...expandedIds, parentId]);
        }
      } else {
        setNewSubtopic("");
      }
      fetchSubtopics();
    } catch (err) {
      alert("System Overload: Failed to archive sub-module data.");
    }
  };

  // Update subtopic
  const handleUpdate = async () => {
    try {
      await SubtopicService.updateSubtopic(editId, {
        subtopic_name: editName
      });

      setEditId(null);
      setEditName("");
      fetchSubtopics();
    } catch (err) {
      alert("Update Failed: Integrity check unsuccessful.");
    }
  };

  // Delete subtopic
  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL ACTION: Deleting this node will permanently erase all nested operational data. Continue?")) return;

    try {
      await SubtopicService.deleteSubtopic(id);
      fetchSubtopics();
    } catch (err) {
      alert("Delete Blocked: Node is protected or system is busy.");
    }
  };

  // Delete selected subtopics (bulk)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`MASS DELETION: You are about to wipe ${selectedIds.length} operational units. Proceed?`)) {
      return;
    }

    try {
      await SubtopicService.deleteByIds({
        ids: selectedIds
      });

      setSelectedIds([]);
      fetchSubtopics();
    } catch (err) {
      alert("Operation Terminated: Batch deletion failure.");
    }
  };

  const renderSubtopic = (item, level = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isEditing = editId === item.id;
    const isAddingChild = addingChildTo === item.id;

    return (
      <div key={item.id} className="w-full">
        <div
          className={`group flex items-center justify-between p-4 border-b border-[#00C2C7]/10 transition-all ${selectedIds.includes(item.id)
              ? 'bg-[#00C2C7]/10 border-l-4 border-l-[#00C2C7]'
              : 'hover:bg-white/5 border-l-4 border-l-transparent'
            }`}
          style={{ paddingLeft: `${level * 2 + 1}rem` }}
        >
          <div className="flex items-center gap-4 flex-1">
            {role === "Instructor" && (
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-5 h-5 rounded border-2 border-[#00C2C7]/40 text-[#00C2C7] focus:ring-offset-0 focus:ring-[#00C2C7]/50 cursor-pointer bg-transparent appearance-none checked:bg-[#00C2C7]"
                />
                {selectedIds.includes(item.id) && <FiCheck className="absolute pointer-events-none left-1 text-[#061E29] font-bold" size={12} />}
              </div>
            )}

            <button
              onClick={() => toggleExpand(item.id)}
              className={`p-1.5 rounded-lg hover:bg-[#00C2C7]/20 transition-all text-[#00C2C7] ${!hasChildren ? 'invisible' : ''}`}
            >
              {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
            </button>

            {level === 0 ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#061E29] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] text-xs font-black shadow-[0_0_15px_rgba(0,194,199,0.3)]">
                <FiLayers size={18} />
              </div>
            ) : level === 1 ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/40 bg-[#00C2C7]/10 text-[10px] font-black">
                <FiActivity size={14} />
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#00C2C7]/40 shadow-[0_0_5px_rgba(0,194,199,0.5)]" />
            )}

            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                className="flex-1 border border-[#00C2C7]/50 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none bg-[#0a2533] text-white"
                autoFocus
              />
            ) : (
              <div className="flex flex-col">
                <span className={`${level === 0 ? 'text-lg font-black text-white' : level === 1 ? 'text-base font-bold text-white/90' : 'text-sm font-medium text-white/70'} tracking-wide`}>
                  {item.subtopic_name}
                </span>
                {level === 0 && <span className="text-[10px] font-black text-[#00C2C7]/50 uppercase tracking-[0.2em] -mt-1">Operational Tier</span>}
              </div>
            )}

            {hasChildren && !isEditing && (
              <span className="ml-2 text-[9px] font-black bg-[#00C2C7]/20 text-[#00C2C7] px-2 py-0.5 rounded-md border border-[#00C2C7]/30 uppercase tracking-tighter">
                {item.children.length} Units
              </span>
            )}
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            {role === "Instructor" && !isEditing && (
              <>
                <button
                  onClick={() => setAddingChildTo(isAddingChild ? null : item.id)}
                  className={`p-2 rounded-xl border transition-all ${isAddingChild ? 'bg-[#00C2C7] text-[#061E29] border-[#00C2C7]' : 'text-[#00C2C7] border-[#00C2C7]/30 hover:bg-[#00C2C7]/20'}`}
                  title="Inject Sub-module"
                >
                  <FiPlusCircle size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditId(item.id);
                    setEditName(item.subtopic_name);
                  }}
                  className="p-2 text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all"
                  title="Modify Meta"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/50 rounded-xl transition-all"
                  title="Terminate Node"
                >
                  <FiTrash2 size={16} />
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button onClick={handleUpdate} className="p-2 text-[#00C2C7] hover:bg-[#00C2C7]/20 rounded-xl border border-[#00C2C7]/30">
                  <FiCheck size={20} />
                </button>
                <button onClick={() => setEditId(null)} className="p-2 text-white/40 hover:bg-white/5 rounded-xl border border-white/20">
                  <FiX size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {isAddingChild && (
          <div
            className="flex gap-3 p-4 bg-[#0a2533]/80 backdrop-blur-md border-b border-[#00C2C7]/20"
            style={{ paddingLeft: `${(level + 1) * 2 + 1}rem` }}
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Define sub-unit for ${item.subtopic_name}...`}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd(item.id)}
                className="w-full border border-[#00C2C7]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2C7]/30 bg-[#061E29] text-white placeholder-white/20"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="w-1 h-1 rounded-full bg-[#00C2C7] animate-pulse"></div>
                <div className="w-1 h-1 rounded-full bg-[#00C2C7] animate-pulse delay-75"></div>
                <div className="w-1 h-1 rounded-full bg-[#00C2C7] animate-pulse delay-150"></div>
              </div>
            </div>
            <button
              onClick={() => handleAdd(item.id)}
              disabled={!childName.trim()}
              className="px-6 py-2.5 bg-[#00C2C7] text-[#061E29] rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#00e2e7] disabled:opacity-30 transition-all shadow-[0_0_15px_rgba(0,194,199,0.3)]"
            >
              Deploy
            </button>
            <button
              onClick={() => setAddingChildTo(null)}
              className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all"
            >
              Abort
            </button>
          </div>
        )}

        {isExpanded && hasChildren && (
          <div className="bg-[#061E29]/40 border-l border-[#00C2C7]/10 ml-6">
            {item.children.map((child) => renderSubtopic(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#061E29] p-8 font-sans text-white overflow-x-hidden relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-[#0a2533]/60 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 mb-8 border border-[#00C2C7]/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FaRobot size={120} />
          </div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-[#061E29] text-4xl shadow-[0_0_30px_rgba(0,194,199,0.4)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30 transform group-hover:rotate-6 transition-transform">
              <FaLayerGroup />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Mission Architecture
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="h-0.5 w-12 bg-[#00C2C7]"></span>
                <p className="text-[#00C2C7] font-black text-xs uppercase tracking-[0.4em]">Operational Matrix v2.0</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            <div className="text-center px-8 py-4 rounded-3xl border border-[#00C2C7]/10 bg-[#061E29]/50 backdrop-blur-md min-w-[140px]">
              <div className="text-4xl font-black text-[#00C2C7] leading-none drop-shadow-[0_0_10px_rgba(0,194,199,0.5)]">
                {subtopics.length}
              </div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Active Nodes</p>
            </div>
          </div>
        </div>

        {role === "Instructor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-[#0a2533]/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 relative group">
              <h2 className="text-[10px] font-black text-[#00C2C7] uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                <FaMicrochip className="animate-pulse" />
                Deploy Root Node
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Designate top-level operational tier... (e.g. FPV DRONE)"
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  className="flex-1 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-4 focus:ring-[#00C2C7]/10 focus:border-[#00C2C7]/40 transition-all bg-[#061E29]/80 placeholder-white/20 text-lg font-bold"
                />
                <button
                  onClick={() => handleAdd()}
                  disabled={!newSubtopic.trim()}
                  className="bg-[#00C2C7] hover:bg-[#00e2e7] text-[#061E29] px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-[#00C2C7]/20 disabled:opacity-20 flex items-center gap-3"
                >
                  <FiPlus size={20} className="font-black" />
                  Build
                </button>
              </div>
            </div>

            <div className={`bg-[#0a2533]/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 transition-all ${selectedIds.length > 0 ? 'border-[#00C2C7]/30 ring-1 ring-[#00C2C7]/20' : 'opacity-80'}`}>
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                <FiActivity />
                Matrix Control ({selectedIds.length})
              </h2>
              <div className="flex gap-3">
                <button onClick={selectAll} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00C2C7] hover:bg-white/10 transition-colors">Select All</button>
                <button onClick={clearSelection} disabled={selectedIds.length === 0} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 disabled:opacity-20">Reset</button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-10"
                >
                  Terminate
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0a2533]/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden min-h-[500px] mb-12">
          <div className="bg-white/5 px-10 py-6 border-b border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-center">
            <h2 className="font-black text-white text-xl flex items-center gap-4 uppercase tracking-tighter">
              <FiList className="text-[#00C2C7] scale-125" />
              Operational Hierarchy
            </h2>
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 bg-[#061E29]/50 px-6 py-2 rounded-full border border-white/5">
              <span className="flex items-center gap-2 text-white/60"><div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-[#00C2C7] to-[#0099a3]"></div> Root Tier</span>
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm border border-[#00C2C7]/50 bg-[#00C2C7]/20"></div> Module</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00C2C7]/30 shadow-[0_0_5px_rgba(0,194,199,0.5)]"></div> Scenario</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#00C2C7]/20 border-t-[#00C2C7] rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-2 border-[#00C2C7]/20 border-b-[#00C2C7] rounded-full animate-reverse-spin"></div>
              </div>
              <p className="font-black text-[#00C2C7] text-xs uppercase tracking-[0.5em] animate-pulse">Syncing Operational Data</p>
            </div>
          ) : subtopicTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-white/10 scale-125">
              <FiTarget size={100} className="mb-8 animate-pulse-slow font-thin" />
              <p className="text-2xl font-black uppercase tracking-[0.3em] italic">No Operational Units Linked</p>
              <p className="text-xs font-black uppercase tracking-widest mt-4 opacity-30">Waiting for Root Category Initialization</p>
            </div>
          ) : (
            <div className="py-6">
              {subtopicTree.map((item) => renderSubtopic(item))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-[#00C2C7]/10 via-transparent to-transparent rounded-[2rem] p-10 border-l-4 border-l-[#00C2C7] border border-white/5">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-[#00C2C7] text-[#061E29] p-4 rounded-2xl shadow-[0_0_20px_rgba(0,194,199,0.2)]"><FiPlusCircle size={28} /></div>
            <div>
              <h4 className="font-black text-white text-xl uppercase tracking-tighter">Instructor Intel</h4>
              <p className="text-white/50 text-sm leading-relaxed max-w-3xl mt-2 font-medium">
                The <span className="text-[#00C2C7] font-bold">Drone Simulation Architecture</span> follows a recursive command structure. Start by establishing top-level categories,
                nest your curriculum modules, and finally deploy specific scenario units. This tactical tree ensures seamless data navigation during flight training.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-20 left-4 bottom-20 w-1 border-l border-white/5 pointer-events-none"></div>
      <div className="fixed top-20 right-4 bottom-20 w-1 border-r border-white/5 pointer-events-none"></div>
    </div>
  );
};

export default Subtopics;
