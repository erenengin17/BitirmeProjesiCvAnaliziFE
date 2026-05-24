import { ConfigProvider } from "antd";
import trTR from "antd/locale/tr_TR";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <ConfigProvider locale={trTR}>
      <AppRouter />
    </ConfigProvider>
  );
}
