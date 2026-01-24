import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  ANALYTICS_DAILY, 
  DETAILED_DOC_STATS, 
  SEARCH_QUERIES, 
  DEPARTMENT_STATS 
} from '../constants';
import { 
  Users, FileText, Eye, TrendingUp, Download, Search, 
  Briefcase, Clock, Activity, ArrowUpRight, ArrowDownRight, Layout
} from 'lucide-react';
import { Button } from './Button';
import { StatusBadge } from './Badge';

// --- Sub-components ---

const KPI: React.FC<{ title: string; value: string; trend?: string; trendUp?: boolean; icon: React.ReactNode }> = ({ 
  title, value, trend, trendUp, icon 
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {trend && (
        <div className={`flex items-center text-xs font-medium mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {trend} vs últimos 30 dias
        </div>
      )}
    </div>
    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
  </div>
);

// --- Tabs ---

type Tab = 'OVERVIEW' | 'CONTENT' | 'DEPARTMENTS' | 'SEARCH';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Analytics V1.2
          </h2>
          <p className="text-gray-500 mt-1">Monitoramento de desempenho do sistema (Apenas Admin)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={16} className="mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
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
            <KPI title="Total de Visualizações (30d)" value="45.2k" trend="12.5%" trendUp={true} icon={<Eye size={20}/>} />
            <KPI title="Usuários Ativos (MAU)" value="1,204" trend="4.3%" trendUp={true} icon={<Users size={20}/>} />
            <KPI title="Tempo Médio de Engajamento" value="4m 12s" trend="2.4%" trendUp={false} icon={<Clock size={20}/>} />
            <KPI title="Consultas de Busca" value="8,902" trend="8.1%" trendUp={true} icon={<Search size={20}/>} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-400" />
              Tendências de Tráfego e Engajamento
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DAILY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <CartesianGrid vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Area type="monotone" dataKey="views" name="Visualizações" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="uniqueUsers" name="Usuários Únicos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Legend verticalAlign="top" height={36}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT TAB --- */}
      {activeTab === 'CONTENT' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <h3 className="font-semibold text-gray-800">Desempenho de Conteúdo Principal</h3>
             <span className="text-xs text-gray-500">Últimos 30 Dias</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Título do Documento</th>
                  <th className="px-6 py-3 text-right">Visitas</th>
                  <th className="px-6 py-3 text-right">Usuários Únicos</th>
                  <th className="px-6 py-3 text-right">Tempo Médio</th>
                  <th className="px-6 py-3 text-right">Prof. Rolagem</th>
                  <th className="px-6 py-3 text-right">Rejeição</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DETAILED_DOC_STATS.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 text-right">{doc.value}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{doc.uniqueViews}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{doc.avgTime}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${doc.scrollDepth}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{doc.scrollDepth}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{doc.bounceRate}%</td>
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
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Produtividade por Departamento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_STATS} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                   <XAxis type="number" />
                   <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Legend />
                   <Bar dataKey="publishedCount" name="Publicados" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                   <Bar dataKey="draftCount" name="Rascunhos" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Engajamento (Visitas) por Departamento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_STATS} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="viewCount" name="Total Visitas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h3 className="font-semibold text-gray-800">Métricas de Departamento</h3>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3">Departamento</th>
                   <th className="px-6 py-3 text-right">Total Docs</th>
                   <th className="px-6 py-3 text-right">Publicados</th>
                   <th className="px-6 py-3 text-right">Rascunhos</th>
                   <th className="px-6 py-3 text-right">Total Visitas</th>
                   <th className="px-6 py-3 text-right">Tempo Médio Publicação</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {DEPARTMENT_STATS.map((dept, idx) => (
                   <tr key={idx} className="hover:bg-gray-50">
                     <td className="px-6 py-4 font-medium text-gray-900">{dept.name}</td>
                     <td className="px-6 py-4 text-right">{dept.docCount}</td>
                     <td className="px-6 py-4 text-right text-green-600">{dept.publishedCount}</td>
                     <td className="px-6 py-4 text-right text-gray-400">{dept.draftCount}</td>
                     <td className="px-6 py-4 text-right font-medium">{dept.viewCount.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right text-gray-500">{dept.avgPublishTime}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* --- SEARCH TAB --- */}
      {activeTab === 'SEARCH' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-3xl mx-auto animate-in fade-in duration-500">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Principais Consultas de Busca</h3>
              <p className="text-sm text-gray-500">O que os usuários estão procurando</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Search size={20} />
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {SEARCH_QUERIES.map((item, index) => (
              <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-sm w-6">#{index + 1}</span>
                  <span className="font-medium text-gray-800 text-lg">{item.query}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">buscas</div>
                  </div>
                  <div className={`text-sm font-medium w-16 text-right ${item.trend > 0 ? 'text-green-600' : item.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {item.trend > 0 ? '+' : ''}{item.trend}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 font-medium hover:underline">Ver Todas as Consultas</button>
          </div>
        </div>
      )}

    </div>
  );
};