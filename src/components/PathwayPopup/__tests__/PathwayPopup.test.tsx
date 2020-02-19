import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PathwayPopup from '../PathwayPopup';

const popupText = 'lorem ipsum';
const triggerText = 'dolor sit amet';

describe('<PathwayPopup />', () => {
  it('renders the trigger', () => {
    const { getByText, queryByText } = render(
      <PathwayPopup Content={<div>{popupText}</div>} Trigger={<div>{triggerText}</div>} />
    );
    expect(queryByText(popupText)).toBeNull();
    expect(queryByText(triggerText)).not.toBeNull();

    // Click the trigger and show the popup
    fireEvent.click(getByText(triggerText));
    expect(queryByText(popupText)).not.toBeNull();
    expect(queryByText(triggerText)).not.toBeNull();

    // Click the away and the popup should disappear
    fireEvent.click(document);
    expect(queryByText(popupText)).toBeNull();
    expect(queryByText(triggerText)).not.toBeNull();
  });
});
