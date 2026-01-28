import React, { useState, useEffect } from 'react';
import '../../styles/variables.css';
import '../../styles/animations.css';
import '../../styles/widget.css';
import WidgetIcon from './WidgetIcon';
import WidgetPanel from './WidgetPanel';

const WidgetContainer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFirstOpen, setIsFirstOpen] = useState(true);

    const toggleWidget = () => {
        setIsOpen(!isOpen);
        if (isFirstOpen) setIsFirstOpen(false);
    };

    return (
        <div className="cirak-widget-container">
            {isOpen && (
                <WidgetPanel
                    onClose={() => setIsOpen(false)}
                    isFirstOpen={isFirstOpen}
                />
            )}
            <WidgetIcon
                isOpen={isOpen}
                onClick={toggleWidget}
            />
        </div>
    );
};

export default WidgetContainer;
