import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Layout ({ children }) {
  return (
    <div className={`min-h-full h-full`}>
      <Head>
        <title>wkao技术博客</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23ff5c00%22></rect><path fill=%22%23fff%22 d=%22M17.95 49.01L17.95 49.01Q17.37 50.99 16.76 53.00Q16.15 55.02 15.52 56.87Q14.89 58.72 14.30 60.35Q13.71 61.99 13.21 63.25L13.21 63.25Q12.87 63.46 12.45 63.59Q12.03 63.71 11.32 63.71L11.32 63.71Q10.65 63.71 10.08 63.48Q9.51 63.25 9.30 62.75L9.30 62.75Q8.80 61.70 8.11 59.47Q7.41 57.25 6.68 54.58Q5.94 51.91 5.29 49.20Q4.64 46.49 4.22 44.48L4.22 44.48Q4.51 44.18 4.95 43.93Q5.40 43.68 6.03 43.68L6.03 43.68Q6.82 43.68 7.20 44.12Q7.58 44.56 7.79 45.53L7.79 45.53Q8.17 47.29 8.67 49.54Q9.18 51.79 9.68 53.93Q10.18 56.07 10.63 57.83Q11.07 59.60 11.28 60.44L11.28 60.44L11.44 60.44Q11.70 59.68 12.18 58.17Q12.66 56.66 13.29 54.70Q13.92 52.75 14.68 50.48Q15.43 48.22 16.19 45.95L16.19 45.95Q16.95 45.53 18.00 45.53L18.00 45.53Q19.55 45.53 19.93 46.62L19.93 46.62Q20.68 48.80 21.38 50.97Q22.07 53.13 22.66 54.98Q23.25 56.83 23.67 58.27Q24.09 59.72 24.34 60.48L24.34 60.48L24.55 60.48Q25.51 56.70 26.65 52.46Q27.78 48.22 28.50 44.06L28.50 44.06Q29.08 43.68 29.92 43.68L29.92 43.68Q30.64 43.68 31.06 44.02Q31.48 44.35 31.48 45.07L31.48 45.07Q31.48 45.53 31.20 46.85Q30.93 48.17 30.47 49.92Q30.01 51.66 29.44 53.65Q28.87 55.65 28.29 57.52Q27.70 59.39 27.17 60.92Q26.65 62.45 26.27 63.25L26.27 63.25Q26.06 63.42 25.58 63.57Q25.09 63.71 24.46 63.71L24.46 63.71Q23.67 63.71 23.14 63.52Q22.62 63.34 22.45 62.92L22.45 62.92Q21.99 61.78 21.46 60.23Q20.94 58.67 20.35 56.85Q19.76 55.02 19.15 53.00Q18.54 50.99 17.95 49.01ZM39.79 63.38L39.79 63.38Q39.58 63.46 39.16 63.57Q38.74 63.67 38.24 63.67L38.24 63.67Q36.43 63.67 36.43 62.16L36.43 62.16L36.43 36.25Q36.64 36.16 37.09 36.06Q37.53 35.95 38.03 35.95L38.03 35.95Q39.79 35.95 39.79 37.46L39.79 37.46L39.79 52.58L48.99 43.68Q50 43.72 50.57 44.16Q51.13 44.60 51.13 45.32L51.13 45.32Q51.13 45.91 50.76 46.35Q50.38 46.79 49.75 47.38L49.75 47.38L42.99 53.30L52.35 61.70Q52.27 62.62 51.79 63.17Q51.30 63.71 50.50 63.71L50.50 63.71Q49.87 63.71 49.35 63.40Q48.82 63.08 48.28 62.50L48.28 62.50L39.79 53.97L39.79 63.38ZM63.73 61.28L63.73 61.28Q65.50 61.28 66.65 60.92Q67.81 60.56 68.31 60.23L68.31 60.23L68.31 54.14L63.10 54.68Q60.92 54.89 59.87 55.67Q58.82 56.45 58.82 57.96L58.82 57.96Q58.82 59.56 60.04 60.42Q61.26 61.28 63.73 61.28ZM63.69 43.51L63.69 43.51Q67.35 43.51 69.49 45.15Q71.63 46.79 71.63 50.32L71.63 50.32L71.63 60.27Q71.63 61.19 71.27 61.68Q70.92 62.16 70.20 62.58L70.20 62.58Q69.19 63.17 67.53 63.61Q65.88 64.05 63.73 64.05L63.73 64.05Q59.79 64.05 57.62 62.50Q55.46 60.94 55.46 58.00L55.46 58.00Q55.46 55.23 57.27 53.82Q59.07 52.42 62.35 52.08L62.35 52.08L68.31 51.49L68.31 50.32Q68.31 48.22 67.05 47.25Q65.79 46.28 63.65 46.28L63.65 46.28Q61.89 46.28 60.33 46.79Q58.78 47.29 57.56 47.92L57.56 47.92Q57.22 47.63 56.95 47.25Q56.68 46.87 56.68 46.41L56.68 46.41Q56.68 45.82 56.97 45.44Q57.27 45.07 57.90 44.73L57.90 44.73Q59.03 44.14 60.50 43.83Q61.97 43.51 63.69 43.51ZM95.78 53.76L95.78 53.76Q95.78 56.11 95.11 58.00Q94.44 59.89 93.20 61.24Q91.96 62.58 90.19 63.29Q88.43 64.01 86.25 64.01L86.25 64.01Q84.06 64.01 82.30 63.29Q80.53 62.58 79.27 61.24Q78.01 59.89 77.34 58.00Q76.67 56.11 76.67 53.76L76.67 53.76Q76.67 51.41 77.36 49.52Q78.06 47.63 79.32 46.28Q80.58 44.94 82.34 44.23Q84.10 43.51 86.25 43.51L86.25 43.51Q88.39 43.51 90.15 44.23Q91.92 44.94 93.16 46.28Q94.39 47.63 95.09 49.52Q95.78 51.41 95.78 53.76ZM86.25 46.28L86.25 46.28Q83.39 46.28 81.75 48.26Q80.11 50.23 80.11 53.76L80.11 53.76Q80.11 57.33 81.73 59.28Q83.35 61.24 86.25 61.24L86.25 61.24Q89.14 61.24 90.74 59.26Q92.34 57.29 92.34 53.76L92.34 53.76Q92.34 50.23 90.72 48.26Q89.10 46.28 86.25 46.28Z%22></path></svg>" />      
      </Head>
      <Header></Header>
      <main className={`flex flex-col h-full`}>
        <div className={`w-full flex-1 max-w-screen-xl mx-auto flex flex-col px-6`}>
          <div className={`flex-1 pt-16`}>
            {children}
          </div>
        </div>
        <Footer></Footer>
      </main>
    </div>
  )
}