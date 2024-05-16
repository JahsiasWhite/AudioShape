// const { ipcMain } = require('electron'); // Mocked
// const myIpcMain = require('../../public/ipcMain'); // Your actual ipcMain file
// import { render, act } from '@testing-library/react';

// var dataDirectory = '';

// jest.mock('electron', () => ({
//   ipcMain: {
//     on: jest.fn((channel, callback) => {
//       callback(); // Simulate event being received and calling the callback
//     }),
//     send: jest.fn(),
//   },
// }));

// jest.mock('../../public/ipcMain', () => {
//   const original = jest.requireActual('../../public/ipcMain'); // Step 2.

//   return {
//     SAVE_TEMP_SONG: original.SAVE_TEMP_SONG,
//     Blob: jest.fn().mockResolvedValue({
//       wavData: {
//         arrayBuffer: jest.fn(() => {
//           return {};
//         }),
//       },
//       numberOfChannels: 2,
//       sampleRate: 44100,
//     }),
//   };
// });

// let temporaryFilePath = null;
// describe('ipcMain Tests', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     temporaryFilePath = 'initial/path'; // Set initial value
//   });

//   it('should listen for the "SAVE_TEMP_SONG" channel', () => {
//     myIpcMain.SAVE_TEMP_SONG(dataDirectory);

//     expect(ipcMain.on).toHaveBeenCalledWith(
//       'SAVE_TEMP_SONG',
//       expect.any(Function)
//     );
//   });

//   it('should call SAVE_TEMP_SONG and save the current song', () => {
//     myIpcMain.SAVE_TEMP_SONG(dataDirectory);
//     ipcMain.send('SAVE_TEMP_SONG', original);

//     expect(ipcMain.on).toHaveBeenCalledWith(
//       'SAVE_TEMP_SONG',
//       expect.any(Function)
//     );
//     expect('temporaryFilePath').toBe(newTemporaryFilePath); // Check if the variable is updated
//   });

//   it('should handle DELETE_TEMP_SONG event and update variables', async () => {
//     const newTemporaryFilePath = 'new/path'; // Expected updated value

//     // Trigger the event (simulate receiving it)
//     myIpcMain.DELETE_TEMP_SONG();
//     ipcMain.send('DELETE_TEMP_SONG');

//     // ipcMain.on.mock.calls[0][1](); // Call the callback function from the mock

//     // Assert expected behavior
//     // expect(unlink).toHaveBeenCalledWith(temporaryFilePath); // Check if unlink is called with the correct path
//     expect(temporaryFilePath).toBe(newTemporaryFilePath); // Check if the variable is updated
//   });
// });
