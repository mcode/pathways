import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MissingDataPopup from '../MissingDataPopup';

const choices = ['foo', 'bar', 'baz'];

describe('<MissingDataPopup />', () => {
  it('renders all the options provided when clicked', () => {
    const { getByText, queryByText } = render(
      <MissingDataPopup values={choices}/>
    );
    choices.forEach(choice => expect(queryByText(choice)).toBeNull());
    fireEvent.click(getByText('missing data'));
    choices.forEach(choice => {
      const renderedChoice = queryByText(choice);
      expect(renderedChoice).not.toBeNull();
    });
  });
});
