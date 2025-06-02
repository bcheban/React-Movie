import MovieCard from "../components/MovieCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  const fetchPopularMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const popularMoviesData = await getPopularMovies();
      setMovies(popularMoviesData);
    } catch (err) {
      setError("Failed to load popular movies...");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchMovies(query);
      setMovies(searchResults);
    } catch (err) {
      setError("Failed to search movies...");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchPopularMovies();
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchPopularMovies, performSearch]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      fetchPopularMovies();
    }
  };

  return (
    <div className="home">
      <form onSubmit={handleFormSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search for movies..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : movies.length > 0 ? (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      ) : !error && searchQuery.trim() ? (
        <div className="info-message">No movies found for "{searchQuery}".</div>
      ) : !error && !searchQuery.trim() ? (
        <div className="info-message">No popular movies to display. Try searching!</div>
      ) : null}
    </div>
  );
}

export default Home;