import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactCountryFlag from "react-country-flag";

const languages = [
  { code: 'en', label: 'English', countryCode: 'GB' },
  { code: 'es', label: 'Español', countryCode: 'ES' },
  { code: 'fr', label: 'Français', countryCode: 'FR' },
  { code: 'de', label: 'Deutsch', countryCode: 'DE' },
  { code: 'it', label: 'Italiano', countryCode: 'IT' },
  { code: 'pt', label: 'Português', countryCode: 'PT' },
  { code: 'zh', label: '中文', countryCode: 'CN' },
  { code: 'ja', label: '日本語', countryCode: 'JP' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
  { code: 'ar', label: 'العربية', countryCode: 'SA' },
  { code: 'hi', label: 'हिन्दी', countryCode: 'IN' },
  { code: 'ko', label: '한국어', countryCode: 'KR' },
  { code: 'nl', label: 'Nederlands', countryCode: 'NL' },
  { code: 'sv', label: 'Svenska', countryCode: 'SE' },
  { code: 'tr', label: 'Türkçe', countryCode: 'TR' },
];

const LanguageModal = ({ open, onClose }) => {
  const { i18n } = useTranslation();

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 10, p: 1 , width:200}}>
        Select Language
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <List sx={{ pt:0, display:"grid", gridTemplateColumns:"0.1fr 0.1fr"}}>
        {languages.map((lang) => (
          <ListItem button key={lang.code} onClick={() => handleLanguageSelect(lang.code)} sx={{m:1}}>
            <ListItemAvatar>
              <Avatar>
                <ReactCountryFlag
                  countryCode={lang.countryCode}
                  svg
                  style={{ width: '1.5em', height: '1.5em' }}
                  title={lang.label}
                />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={lang.label} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default LanguageModal;
