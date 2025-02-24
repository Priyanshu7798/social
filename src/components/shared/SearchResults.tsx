import { Models } from 'appwrite'
import Loader from './Loader'
import GridPostList from './GridPostList'
type searchResultProps = {
    isSearchFetching : boolean,
    searchedPosts : Models.Document[],
}

const SearchResults = ({isSearchFetching ,searchedPosts } : searchResultProps) => {

    if(isSearchFetching) return <Loader />

    if(searchedPosts && searchedPosts.length > 0) {
        return (
            <GridPostList posts={searchedPosts} />
        )
    }


  return (
    <p className='text-light-4 w-full mt-10 text-center'>No Result Found</p>
  )
}

export default SearchResults