function ErrorMessages() {
  window.electron.ipcRenderer.on('ERROR_MESSAGE', (err) => {
    console.error(err);
  });

  return <div className="message-container"></div>;
}

export default ErrorMessages;
