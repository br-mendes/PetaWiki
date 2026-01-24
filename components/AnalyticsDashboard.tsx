
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  Users, FileText, Eye, TrendingUp, Download, Search, 
  Briefcase, Clock, Activity, ArrowUpRight, ArrowDownRight, Layout
} from 'lucide-react';
import { Button } from './Button';
import { StatusBadge } from './Badge';
import { supabase } from '../lib/supabase';
import { DailyStat, DepartmentStat, SearchQueryStat, Document } from '../types';

// --- Interfaces para Dados Reais ---

interface RealDocumentStat {
    id: string;
    title: string;
    views: number;
    status: 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW';
}

// --- Sub-components ---

const KPI: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode }> = ({ 
  title, value, subtext, icon 
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-start justify-between">
    <div>
      <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      {subtext && (
        <div className="flex items-center text-xs font-medium mt-2 text-gray-500 dark:text-gray-400">
          {subtext}
        </div>
      )}
    </div>
    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg">{icon}</div>
  </div>
);

// --- Tabs ---

type Tab = 'OVERVIEW' | 'CONTENT' | 'DEPARTMENTS' | 'SEARCH';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  // Real Data State
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [searchQueries, setSearchQueries] = useState<SearchQueryStat[]>([]);
  const [topDocs, setTopDocs] = useState<RealDocumentStat[]>([]);
  
  // Aggregate KPI State
  const [totalViews, setTotalViews] = useState(0);
  const [totalUniqueUsers, setTotalUniqueUsers] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
        // 1. Daily Stats (Last 30 Days)
        const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_analytics');
        if (!dailyError && dailyData) {
            setDailyStats(dailyData);
            // Calc Totals from Daily
            const viewsSum = dailyData.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0);
            const usersSum = dailyData.reduce((acc: number, curr: any) => acc + (curr.unique_users || 0), 0);
            setTotalViews(viewsSum);
            setTotalUniqueUsers(usersSum);
        }

        // 2. Department Stats
        const { data: deptData, error: deptError } = await supabase.rpc('get_department_analytics');
        if (!deptError && deptData) {
            // Mapear snake_case para camelCase
            const mappedDept = deptData.map((d: any) => ({
                name: d.name,
                docCount: d.doc_count,
                viewCount: d.view_count,
                publishedCount: d.published_count,
                draftCount: d.draft_count,
                avgPublishTime: '-' // Calculo complexo, ignorar por agora
            }));
            setDepartmentStats(mappedDept);
        }

        // 3. Search Queries
        const { data: searchData, error: searchError } = await supabase.rpc('get_top_searches');
        if (!searchError && searchData) {
            setSearchQueries(searchData.map((s: any) => ({ query: s.query, count: s.count, trend: 0 })));
        }

        // 4. Content Performance (Top Docs by View)
        const { data: docsData } = await supabase
            .from('documents')
            .select('id, title, views, status')
            .order('views', { ascending: false })
            .limit(10);
            
        if (docsData) {
            setTopDocs(docsData);
        }

    } catch (e) {
        console.error("Erro ao carregar analytics", e);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-blue-600" />
            Analytics em Tempo Real
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dados reais obtidos diretamente do banco de dados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchAnalyticsData}>
             Atualizar Dados
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Visão Geral', icon: Layout },
            { id: 'CONTENT', label: 'Desempenho de Conteúdo', icon: FileText },
            { id: 'DEPARTMENTS', label: 'Departamentos', icon: Briefcase },
            { id: 'SEARCH', label: 'Insights de Busca', icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'}
              `}
            >
              <tab.icon size={16} className={`mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPI title="Total de Visualizações (30d)" value={totalViews.toString()} subtext="Baseado em eventos" icon={<Eye size={20}/>} />
            <KPI title="Usuários Ativos (30d)" value={totalUniqueUsers.toString()} subtext="Usuários logados únicos" icon={<Users size={20}/>} />
            <KPI title="Consultas de Busca" value={searchQueries.reduce((a,b) => a + Number(b.count), 0).toString()} subtext="Termos pesquisados" icon={<Search size={20}/>} />
            <KPI title="Docs Publicados" value={departmentStats.reduce((a,b) => a + Number(b.publishedCount), 0).toString()} subtext="Total na base" icon={<FileText size={20}/>} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-400" />
              Tendências de Tráfego (Últimos 30 Dias)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <CartesianGrid vertical={false} stroke="#f3f4f6" strokeOpacity={0.5} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Area type="monotone" dataKey="views" name="Visualizações" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="unique_users" name="Usuários Únicos" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
                  <Legend verticalAlign="top" height={36}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT TAB --- */}
      {activeTab === 'CONTENT' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
             <h3 className="font-semibold text-gray-800 dark:text-white">Conteúdo Mais Popular</h3>
             <span className="text-xs text-gray-500">Top 10 por total de visualizações</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3">Título do Documento</th>
                  <th className="px-6 py-3 text-right">Visitas Totais</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {topDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{doc.title}</td>
                    <td className="px-6 py-4 text-right">{doc.views}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={doc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DEPARTMENTS TAB --- */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Produtividade por Departamento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.3} />
                   <XAxis type="number" stroke="#9ca3af" />
                   <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#9ca3af'}} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Legend />
                   <Bar dataKey="publishedCount" name="Publicados" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                   <Bar dataKey="draftCount" name="Rascunhos" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Engajamento (Visitas Geradas)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="viewCount" name="Total Visitas nos Docs" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
               <h3 className="font-semibold text-gray-800 dark:text-white">Tabela Detalhada por Departamento</h3>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                 <tr>
                   <th className="px-6 py-3">Departamento</th>
                   <th className="px-6 py-3 text-right">Total Docs</th>
                   <th className="px-6 py-3 text-right">Publicados</th>
                   <th className="px-6 py-3 text-right">Rascunhos</th>
                   <th className="px-6 py-3 text-right">Visitas Recebidas</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {departmentStats.map((dept, idx) => (
                   <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                     <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{dept.name}</td>
                     <td className="px-6 py-4 text-right dark:text-gray-300">{dept.docCount}</td>
                     <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">{dept.publishedCount}</td>
                     <td className="px-6 py-4 text-right text-gray-400">{dept.draftCount}</td>
                     <td className="px-6 py-4 text-right font-medium dark:text-blue-300">{dept.viewCount.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* --- SEARCH TAB --- */}
      {activeTab === 'SEARCH' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-3xl mx-auto animate-in fade-in duration-500">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Principais Consultas de Busca</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">O que os usuários estão procurando</p>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg">
              <Search size={20} />
            </div>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {searchQueries.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-400 italic">
                    Nenhuma busca registrada ainda.
                </li>
            ) : searchQueries.map((item, index) => (
              <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-sm w-6">#{index + 1}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-lg">{item.query}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">buscas</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
