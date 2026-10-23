export const ckoUniversalContentTokens = {
  brand: "#1A3E74",
  fonts: {
    display: ["Nunito Sans","Inter","Arial","sans-serif"],
    body: ["Inter","Arial","sans-serif"]
  },
  breakpoints: { xs:360, sm:480, md:768, lg:1024, xl:1280, xxl:1440 },
  accessibility: { minTouchTarget:44, bodyMinPx:16, prosePreferredCh:68 },
  families: {
    editorialContent: { accent:"#1A3E74", soft:"#F2F7FC", container:880 },
    studyGuide: { accent:"#1D5FD1", soft:"#EFF6FF", container:1040 },
    quickReference: { accent:"#163269", soft:"#F8FAFC", container:820 },
    bookPublication: { accent:"#1A3E74", soft:"#F2F7FC", container:880 },
    assessment: { accent:"#6D28D9", soft:"#F5F3FF", container:1040 },
    clinicalSimulation: { accent:"#1E4FAE", soft:"#EFF6FF", container:1040 },
    visualLearning: { accent:"#0E7490", soft:"#ECFEFF", container:1280 }
  }
} as const;
