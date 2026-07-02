import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaRocket,
} from "react-icons/fa";

import {
  Pie,
  Doughnut,
  Line,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

import DashboardHeader from "../components/analytics/DashboardHeader";
import StatCard from "../components/analytics/StatCard";

import "../styles/analytics.css";

import { getTasks } from "../services/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

function Analytics() {
  const [tasks, setTasks] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    productivity: 0,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getTasks();

      setTasks(data);

      const completed = data.filter(
        (t) => t.completed
      ).length;

      setStats({
        total: data.length,
        completed,
        pending: data.length - completed,
        productivity:
          data.length === 0
            ? 0
            : Math.round(
                (completed / data.length) * 100
              ),
      });
    } catch (err) {
      console.error(err);
    }
  }

  /* ===========================
      CATEGORY COUNTS
  =========================== */

  const work = tasks.filter(
    (t) => t.category === "Work"
  ).length;

  const study = tasks.filter(
    (t) => t.category === "Study"
  ).length;

  const health = tasks.filter(
    (t) => t.category === "Health"
  ).length;

  const personal = tasks.filter(
    (t) => t.category === "Personal"
  ).length;

  /* ===========================
      CHART DATA
  =========================== */

  const completionData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [
          stats.completed,
          stats.pending,
        ],
        backgroundColor: [
          "#18d39e",
          "#ff8b38",
        ],
        borderWidth: 0,
      },
    ],
  };

  const categoryData = {
    labels: [
      "Work",
      "Study",
      "Health",
      "Personal",
    ],
    datasets: [
      {
        data: [
          work,
          study,
          health,
          personal,
        ],
        backgroundColor: [
          "#7B2FF7",
          "#18d39e",
          "#ff8b38",
          "#d946ef",
        ],
      },
    ],
  };

  /* ===========================
   WEEKLY DATA (REAL)
=========================== */

const weekLabels = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const createdPerDay = new Array(7).fill(0);
const completedPerDay = new Array(7).fill(0);

tasks.forEach((task) => {

  // Created Tasks
  if (task.createdAt) {

    const createdDate = new Date(task.createdAt);

    // JS:
    // Sunday=0 Monday=1 ... Saturday=6
    // convert Monday first

    const day =
      (createdDate.getDay() + 6) % 7;

    createdPerDay[day]++;

  }

  // Completed Tasks

  if (task.completed && task.updatedAt) {

    const completedDate =
      new Date(task.updatedAt);

    const day =
      (completedDate.getDay() + 6) % 7;

    completedPerDay[day]++;

  }

});

const weeklyData = {

  labels: weekLabels,

  datasets: [

    {

      label: "Tasks Created",

      data: createdPerDay,

      borderColor: "#dde7e0",

      backgroundColor:
      "rgba(123,47,247,.15)",

      fill: true,

      tension: .45,

      pointRadius: 5,

    },

    {

      label: "Tasks Completed",

      data: completedPerDay,

      borderColor: "#18d39e",

      backgroundColor:
      "rgba(232, 142, 142, 0.89)",

      fill: true,

      tension: .45,

      pointRadius: 5,

    },

  ],

};

  /* ===========================
      CHART OPTIONS
  =========================== */

  const commonLegend = {
    position: "bottom",

    labels: {
      color: "#ffffff",

      usePointStyle: true,

      pointStyle: "circle",

      padding: 20,

      font: {
        size: 12,
        weight: "600",
      },
    },
  };

  const doughnutOptions = {
    responsive: true,

    cutout: "72%",

    plugins: {
      legend: commonLegend,
    },

    animation: {
      animateRotate: true,
      duration: 1500,
    },
  };

  const pieOptions = {
    responsive: true,

    plugins: {
      legend: commonLegend,
    },

    animation: {
      duration: 1500,
    },
  };

  const lineOptions = {

  responsive: true,

  maintainAspectRatio: false,

  interaction: {

    intersect:false,

    mode:"index",

  },

  plugins: {

    legend: commonLegend,

  },

  scales: {

    x: {

      grid: {

        display:false,

      },

      ticks: {

        color:"#ddd",

      },

    },

    y: {

      beginAtZero:true,

      ticks: {

        precision:0,

        stepSize:1,

        color:"#ddd",

      },

      grid: {

        color:"rgba(255,255,255,.08)",

      },

    },

  },

};

  return (
    <div className="analytics-page">
      <DashboardHeader />

      <section className="stats-grid-v2">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          color="#7B2FF7"
          icon={<FaClipboardList />}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          color="#18d39e"
          icon={<FaCheckCircle />}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          color="#ff8b38"
          icon={<FaClock />}
        />

        <StatCard
          title="Productivity"
          value={`${stats.productivity}%`}
          color="#d946ef"
          icon={<FaRocket />}
        />
      </section>

      <section className="dashboard-row">
        <div className="dashboard-card tall">
          <h3 className="dashboard-title">
            Completion Rate
          </h3>

          <Doughnut
            data={completionData}
            options={doughnutOptions}
          />
        </div>

        <div className="dashboard-card tall">
          <h3 className="dashboard-title">
            Category Distribution
          </h3>

          <Pie
            data={categoryData}
            options={pieOptions}
          />
        </div>
      </section>

      <section className="dashboard-row">
        <div className="dashboard-card wide">
          <h3 className="dashboard-title">
            Weekly Progress
          </h3>

          <div
            style={{
              height: 220,
            }}
          >
            <Line
              data={weeklyData}
              options={lineOptions}
            />
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-title">
            Performance
          </h3>

          <div className="score-circle">
            <div className="score-value">
              {stats.productivity}%

              <span>
                Keep Going 🚀
              </span>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}

export default Analytics;