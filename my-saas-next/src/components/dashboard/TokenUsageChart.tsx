import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { day: 'Mon', tokens: 1240 },
  { day: 'Tue', tokens: 1890 },
  { day: 'Wed', tokens: 2300 },
  { day: 'Thu', tokens: 3490 },
  { day: 'Fri', tokens: 4500 },
  { day: 'Sat', tokens: 1800 },
  { day: 'Sun', tokens: 900 },
];

export const TokenUsageChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="tokens" 
            stroke="#6366f1" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorTokens)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
