# Green Flow Shop PFE

A comprehensive multi-objective optimization dashboard for flow shop scheduling problems with energy considerations.

## 🚀 Live Demo

[View Live Demo](https://yourusername.github.io/green-flow-shop-pfe)

## 📋 Features

- **Multi-Objective Optimization**: Simultaneous optimization of makespan and energy consumption
- **Algorithm Comparison**: Compare HNSGA-II, HMOSA, and HMOGVNS algorithms
- **Interactive Visualizations**: Pareto front analysis and performance metrics
- **Problem Data Analysis**: VRF benchmark instances and sensitivity analysis
- **Real-time Charts**: Processing times and algorithm performance visualization

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Build Tool**: Vite
- **Routing**: React Router

## 🏗️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/green-flow-shop-pfe.git
   cd green-flow-shop-pfe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # Data services
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Data Structure

The application works with:
- **VRF Benchmark**: Variable Rate Flow shop instances
- **Energy Profiles**: Time-varying electricity prices
- **Pareto Data**: Multi-objective optimization results
- **Performance Metrics**: Algorithm comparison data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- VRF benchmark dataset creators
- Multi-objective optimization research community
- React and Vite development teams