import React, { createContext, useState } from "react";

const AuthorContext = createContext();

const AuthorProvider = ({ children }) => {
  
  const [followedAuthors, setFollowedAuthors] = useState([]);

  return (
    <AuthorContext.Provider value={{followedAuthors, setFollowedAuthors }}>
      {children}
    </AuthorContext.Provider>
  );
};

export { AuthorContext, AuthorProvider }

