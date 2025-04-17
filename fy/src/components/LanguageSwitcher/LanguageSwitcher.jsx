import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl } from '@mui/material';
import ReactCountryFlag from "react-country-flag";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        width: 50,
        height: 50,
        borderRadius: '30%',
        overflow: 'hidden',
        // Remove border and background if desired
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiSelect-select': {
          padding: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        inputProps={{ 'aria-label': 'Language switcher' }}
      >
        <MenuItem value="en">
          <ReactCountryFlag
            countryCode="US"
            svg
            style={{ width: '1.5em', height: '1.5em', borderRadius: '50%' }}
            title="US"
          />
        </MenuItem>
        <MenuItem value="es">
          <ReactCountryFlag
            countryCode="ES"
            svg
            style={{ width: '1.5em', height: '1.5em', borderRadius: '50%' }}
            title="Spain"
          />
        </MenuItem>
        {/* Add additional languages as needed */}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
