
export default function OG(
  title: string = "TechSquidTV - Kyle from the internet",
  heroImageURL: string,
) {
  const backgroundImageURL = "http://localhost:3001/opengraph/tstv-og-bg.png";
  const fontSize = (title: string) => {
    if (title.length < 18) {
      return "7rem"
    }
    if (title.length < 28) {
      return "5.5rem"
    }
    if (title.length < 46) {
      return "5rem"
    }
    if (title.length < 52) {
      return "5rem"
    }
    return "4rem"
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${backgroundImageURL})`,
        backgroundSize: "cover",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
        alignItems: "center",
        position: "relative",
      }}
    >
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
          padding: "2rem 4rem",
          fontSize: fontSize(title),
          textOverflow: "ellipsis",
          overflow: "hidden",
          fontWeight: "bold",
          color: "white",
          fontFamily: "Inter",
          wordBreak: "break-word",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
          width: "100%",
          margin: "2.5rem",
          height: "85%",
          borderRadius: "24px",
          backgroundImage: `url(http://localhost:3001/blog/${heroImageURL})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></div>
      <img src="http://localhost:3001/opengraph/tstv-badge.png" style={{position: "absolute", bottom: "0", right: "0", zIndex: 100}} width="146px"/>
    </div>
  );
}