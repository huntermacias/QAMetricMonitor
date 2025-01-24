import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend } from "recharts";

interface AnalyticsPanelProps {
  show: boolean;
  data: any[];
  colors: string[];
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ show, data, colors }:AnalyticsPanelProps) => {

  return (
    <AnimatePresence>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden mb-6 border rounded-md p-4 shadow"
      >
        <h2 className="text-lg font-semibold mb-4">Distribution by WorkItemType</h2>
        {data.length === 0 && (
          <p className="italic text-gray-500 dark:text-gray-400">No data to show.</p>
        )}
        {data.length > 0 && (
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={colors[idx % colors.length]}
                    />
                  ))}
                </Pie>
                <RechartTooltip
                  contentStyle={{ backgroundColor: "#1f2937" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-6 w-full h-64">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#888" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <RechartTooltip
                contentStyle={{ backgroundColor: "#1f2937" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="value" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default AnalyticsPanel;