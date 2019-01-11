import _ from 'lodash';
import moment from 'moment';

/**
 * isUUID
 *      Validate if input string is uuid
 *
 * @return  {boolean} uuid
 * @param  {string} uuid
 */
const isUUID = uuid => uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid.toString());

/**
 * isBooleanString
 *      Validate if input string is 'true' or 'false'
 *
 * @return  {boolean} value
 * @param  {string} value
 */
const isBooleanString = value => value === 'true' || value === 'false';

/**
 * isValidDate
 *      Validate if input string is valid date
 *
 * @return  {boolean} stringDate
 * @param  {string} stringDate
 */
const isValidDate = (stringDate) => {
  const formats = [moment.ISO_8601, 'MM/DD/YYYY', 'YYYY-MM-DD'];
  return _.isEmpty(stringDate) ? false : moment(stringDate, formats, true).isValid();
};

/**
 * isValidJson
 *      Validate if input string is valid stringify json
 *
 * @return  {boolean} isJson
 * @param  {string} json
 */
const isValidJson = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return false;
  }
};

/**
 * isUrl
 *      Validate if input string is valid stringify json
 *
 * @return  {boolean} isJson
 * @param  {string} text
 */
const isUrl = text => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(text.toString());


export default {
  isUUID,
  isBooleanString,
  isValidDate,
  isValidJson,
  isUrl,
};
