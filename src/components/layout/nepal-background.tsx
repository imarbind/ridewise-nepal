export const NepalBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20">
      <svg className="absolute bottom-0 w-full text-primary/20" viewBox="0 0 1440 320" fill="currentColor">
         <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent blur-3xl rounded-full" />
    </div>
  );
  