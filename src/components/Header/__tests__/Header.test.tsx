import React from 'react';
import { render } from '@testing-library/react';
import Header from '../Header';

describe('<Header />', () => {
  it('renders a visible header title and logo', () => {
    const { getByRole } = render(<Header logo="logo" />);
    expect(getByRole('img')).toBeVisible();
  });
});
