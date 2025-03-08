import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';
 

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

//console.log(API_KEY)

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
  


const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const [movieList, setMovieList] = useState([]);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebounceSearcTerm] = useState('');

  useDebounce(() => 
    setDebounceSearcTerm(searchTerm), 1000, [searchTerm]
  );
 
  const fetchMovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');

    const endpoint = query 
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/discover/movie?sort_bu=popularity.desc`

    const API_OPTIONS = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    }

    try {
      const response = await fetch(endpoint, API_OPTIONS);


      if(!response.ok){
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log(data);
  
      console.log(data.results);

      if(data.Response === 'False'){
        setErrorMessage('No movies found');
        setMovieList([])
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(error);
      setErrorMessage('Something went wrong while fetching the movies');
      
    }finally{
      setIsLoading(false);
    }

}

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.log(error);
      
    }

  }


  useEffect(() => {
    fetchMovies(debouncedSearchTerm);

    return () => {
      // cleanup
    }

  },[debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies </span>You'll Enjoy without the hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>

        </header>


        <section className='trending'>
          <h2>Trending Movies </h2>
          <ul>
            {
              trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
              
                </li>
              ))
            }
          </ul>
        </section>



        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {
                movieList.map(movie => (
                <MovieCard key={movie.id} movie={movie}/>
                ))
              }
            </ul>
          )}

        </section>
        
      </div>
    
    </main>
 
  )
}

export default App