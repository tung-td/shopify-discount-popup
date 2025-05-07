import React, { useState } from 'react';
import AdminUI from './components/AdminUI';
import StoreFrontUI from './components/StoreFrontUI';

const App: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const toggleAdmin = () => {
        setIsAdmin(!isAdmin);
    };

    return (
        <div>
            <button onClick={toggleAdmin}>
                {isAdmin ? 'Switch to Storefront' : 'Switch to Admin'}
            </button>
            {isAdmin ? <AdminUI /> : <StoreFrontUI />}
        </div>
    );
};

export default App;