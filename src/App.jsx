import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import AddBook from './pages/AddBook.jsx';
import BookDetail from './pages/BookDetail.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
