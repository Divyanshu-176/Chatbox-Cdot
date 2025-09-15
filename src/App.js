import Chatbox from "./components/Chatbox";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const ContentImprove = lazy(() => import("./contentimprove/ContentImprove"));
const QAHistoryTable = lazy(() => import("./history/QAHistoryTable"))
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Chatbox />} />
          
          
          <Route
          path="/contentwriter"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ContentImprove />
            </Suspense>
          }
        />
        <Route
          path="/qahistory"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <QAHistoryTable />
            </Suspense>
          }
        />
        </Routes>
      </BrowserRouter>
     
    </div>
  );
}

export default App;
