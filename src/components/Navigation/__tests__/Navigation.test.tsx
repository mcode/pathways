import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import MockedNavigation from 'testUtils/MockedNavigation';

describe('<Navigation />', () => {
  const renderComponent = (): RenderResult => render(<MockedNavigation />);

  it('can select a pathway', () => {
    const { getByLabelText, getByText, getAllByText } = renderComponent();

    fireEvent.keyDown(getByLabelText('Pathway:', { selector: 'input' }), { keyCode: 40 });
    fireEvent.click(getAllByText('test1')[0]);

    expect(getByText('test1')).toBeInTheDocument();
  });
});
