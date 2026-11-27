
export default function AnimatedCookbook() {
  return (
    <section
      aria-label="Smart Baking Assistant interactive cookbook"
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "650px",
        overflow: "hidden",
        backgroundColor: "#f7f1e8",
      }}
    >
      <iframe
        src="/landing-pages/baking-cookbook.html"
        title="Smart Baking Assistant — The Baking Journal"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </section>
  );
}
