import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BikeSelector from '../BikeSelector'; // Adjust the import path as needed
import { act } from 'react-dom/test-utils';
import { LanguageProvider } from '../../context/LanguageContext';
import { AuthProvider } from '../../context/AuthContext';


// Mocking useFetchBikes and the props functions
jest.mock('../hooks/useFetchBikes', () => ({
  useFetchBikes: () => [
    { id: 'bike1', name: 'Mountain Bike', stock: 1, price: 100, specs: 'Specs1', Small: 1, Medium: 1, Large: 1, sizing: "LMS", image: "https://via.placeholder.com/150", alt: "Mountain Bike" },
    { id: 'bike2', name: 'Road Bike', stock: 1, price: 100, specs: 'Specs2', Small: 1, Medium: 1, Large: 1, sizing: "LMS", image: "https://via.placeholder.com/150", alt: "Road Bike" }
  ]
}));

const mockOnSelectBike = jest.fn();
const mockOnSizeSelect = jest.fn();

describe('BikeSelector', () => {
  test('allows a user to select a bike', () => {
    act(() => {
      const { getByText } = render(
        <LanguageProvider>
          <AuthProvider>
            <BikeSelector onSelectBike={mockOnSelectBike} onSizeSelect={mockOnSizeSelect} selectedBike={null} selectedSize={null} accessories={[]} selectedAccessories={[]} setSelectedAccessories={() => { }} handleAccessoryToggle={() => { }} getAvailableStockForSize={() => 1} startDate={new Date()} datePickerRef={React.createRef()} userLoggedIn={false} />
          </AuthProvider>
        </LanguageProvider>
      );
    });
    const bikeElement = getByText('Mountain Bike');
    fireEvent.click(bikeElement);

    expect(mockOnSelectBike).toHaveBeenCalledWith(expect.objectContaining({
      id: 'bike1',
      name: 'Mountain Bike',
      price: 100,
      specs: 'Specs1',
      Small: 1,
      Medium: 1,
      Large: 1,
      stock: 1,
      sizing: "LMS"
    }));
  });

  test('allows a user to select a size', () => {
    // Mock selectedBike with all required properties
    const selectedBikeMock = {
      id: 'bike1',
      name: 'Mountain Bike',
      price: 100,
      specs: 'Specs1',
      Small: 1,
      Medium: 1,
      Large: 1,
      stock: 1,
      sizing: "LMS"
    };

    const { getByText } = render(
      <LanguageProvider>
        <AuthProvider>
          <BikeSelector
            selectedBike={{ ...selectedBikeMock, alt: "Mountain Bike", image: "https://via.placeholder.com/150" }}
            datePickerRef={React.createRef()}
            onSelectBike={mockOnSelectBike}
            onSizeSelect={mockOnSizeSelect}
            selectedSize={null}
            accessories={[]}
            selectedAccessories={[]}
            setSelectedAccessories={() => { }}
            handleAccessoryToggle={() => { }}
            getAvailableStockForSize={() => 1}
            startDate={new Date()}
            userLoggedIn={false}
          />
        </AuthProvider>
      </LanguageProvider>
    );

    const sizeButton = getByText('Medium');
    fireEvent.click(sizeButton);

    expect(mockOnSizeSelect).toHaveBeenCalledWith('Medium');
  });
});
