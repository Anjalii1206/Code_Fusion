import {Box, Button, Menu, MenuItem, MenuButton, MenuList, Text } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "./Constants";
    
const languages = Object.entries(LANGUAGE_VERSIONS);
    
const LanguageItem = ({ language, version, isSelected, onSelect }) => {
      const backgroundColor = isSelected? "gray.900" : "transparent";
      const color = isSelected? "teal" : "";
    
      return (
        <MenuItem
          key={language}
          color={color}
          fontSize="sm"
          bg={backgroundColor}
          _hover={{
            color: "teal",
            bg: "gray.900",
          }}
          onClick={() => onSelect(language)}
        >
          {language}
          &nbsp;
          <Text as="span" color="gray.600" fontSize="sm">({version})</Text>
        </MenuItem>
      );
    };
    
    const LanguageSelector = ({ language, onSelect }) => {
      return (
        <Box >
          {/* <Text sx={{ fontSize: '18px', paddingTop: '10px', paddingBottom: '10px'}}> &nbsp; Language: &nbsp;</Text> */}
          <Box style={{ display: "flex" }}>
          <Menu >
            <MenuButton as={Button}>{language}</MenuButton>
            <MenuList bg="#110c1b">
              {languages.map(([lang, version]) => (
                <LanguageItem
                  key={lang}
                  language={lang}
                  version={version}
                  isSelected={lang === language}
                  onSelect={onSelect}
                />
              ))}
            </MenuList>
            <br></br>
          </Menu>
          </Box>
        </Box>
      );
    };
    
    export default LanguageSelector;