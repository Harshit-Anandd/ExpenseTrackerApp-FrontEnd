import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineChartPie,
  HiOutlineCreditCard,
  HiOutlineBell,
  HiOutlineShieldCheck,
} from "react-icons/hi";
const features = [
  {
    icon: HiOutlineCreditCard,
    title: "Track Expenses & Income",
    desc: "Effortlessly log transactions with categories, payment methods, and receipt uploads.",
  },
  {
    icon: HiOutlineChartPie,
    title: "Visual Analytics",
    desc: "Interactive charts and dashboards to understand your spending patterns.",
  },
  {
    icon: HiOutlineBell,
    title: "Smart Alerts",
    desc: "Budget threshold notifications and recurring transaction reminders.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Secure & Private",
    desc: "JWT-secured sessions with role-based access. Your data stays yours.",
  },
];
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="glass-topbar px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-primary">
          💰 SpendSmart
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-white/20 rounded-lg transition-all"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold text-primary leading-tight mb-6">
              Take Control of Your <br />
              <span className="text-gradient">Financial Future</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Track expenses, manage budgets, visualize spending patterns, and
              make smarter financial decisions — all in one beautifully crafted
              platform.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-lg"
              >
                Start for Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 glass-card text-primary rounded-xl font-semibold text-base hover:bg-white/25 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="glass-card-solid p-6 hover:shadow-lg transition-all"
            >
              <f.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-display font-semibold text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="glass-topbar px-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 SpendSmart. Your finances, simplified.
      </footer>
    </div>
  );
};
var LandingPage_default = LandingPage;
export { LandingPage_default as default };
