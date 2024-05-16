import './SpeedupButtonSVG.css';

const ShuffleButtonSVG = ({ shuffleIsEnabled, onClick }) => {
  return (
    <div>
      <svg
        className="speedup-button"
        height="800px"
        width="800px"
        fill={shuffleIsEnabled ? '#316baa' : '#FFF'}
        version="1.1"
        id="shuffle"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 25 25"
        onClick={onClick}
      >
        <path d="M2 16.25C1.58579 16.25 1.25 16.5858 1.25 17C1.25 17.4142 1.58579 17.75 2 17.75V16.25ZM10.7478 14.087L10.1047 13.7011L10.7478 14.087ZM13.2522 9.91303L13.8953 10.2989L13.2522 9.91303ZM22 7L22.5303 7.53033C22.8232 7.23744 22.8232 6.76256 22.5303 6.46967L22 7ZM19.4697 8.46967C19.1768 8.76256 19.1768 9.23744 19.4697 9.53033C19.7626 9.82322 20.2374 9.82322 20.5303 9.53033L19.4697 8.46967ZM20.5303 4.46967C20.2374 4.17678 19.7626 4.17678 19.4697 4.46967C19.1768 4.76256 19.1768 5.23744 19.4697 5.53033L20.5303 4.46967ZM15.2205 7.3894L14.851 6.73675V6.73675L15.2205 7.3894ZM2 17.75H5.60286V16.25H2V17.75ZM11.3909 14.4728L13.8953 10.2989L12.6091 9.52716L10.1047 13.7011L11.3909 14.4728ZM18.3971 7.75H22V6.25H18.3971V7.75ZM21.4697 6.46967L19.4697 8.46967L20.5303 9.53033L22.5303 7.53033L21.4697 6.46967ZM22.5303 6.46967L20.5303 4.46967L19.4697 5.53033L21.4697 7.53033L22.5303 6.46967ZM13.8953 10.2989C14.3295 9.57518 14.6286 9.07834 14.9013 8.70996C15.1644 8.35464 15.3692 8.16707 15.59 8.04205L14.851 6.73675C14.384 7.00113 14.0315 7.36397 13.6958 7.8174C13.3697 8.25778 13.0285 8.82806 12.6091 9.52716L13.8953 10.2989ZM18.3971 6.25C17.5819 6.25 16.9173 6.24918 16.3719 6.30219C15.8104 6.35677 15.3179 6.47237 14.851 6.73675L15.59 8.04205C15.8108 7.91703 16.077 7.83793 16.517 7.79516C16.9733 7.75082 17.5531 7.75 18.3971 7.75V6.25ZM5.60286 17.75C6.41814 17.75 7.0827 17.7508 7.62807 17.6978C8.18961 17.6432 8.6821 17.5276 9.14905 17.2632L8.41 15.9579C8.18919 16.083 7.92299 16.1621 7.48296 16.2048C7.02675 16.2492 6.44685 16.25 5.60286 16.25V17.75ZM10.1047 13.7011C9.67046 14.4248 9.37141 14.9217 9.09867 15.29C8.8356 15.6454 8.63081 15.8329 8.41 15.9579L9.14905 17.2632C9.616 16.9989 9.96851 16.636 10.3042 16.1826C10.6303 15.7422 10.9715 15.1719 11.3909 14.4728L10.1047 13.7011Z" />
        <path d="M2 6.25C1.58579 6.25 1.25 6.58579 1.25 7C1.25 7.41421 1.58579 7.75 2 7.75V6.25ZM22 17L22.5303 17.5303C22.8232 17.2374 22.8232 16.7626 22.5303 16.4697L22 17ZM20.5303 14.4697C20.2374 14.1768 19.7626 14.1768 19.4697 14.4697C19.1768 14.7626 19.1768 15.2374 19.4697 15.5303L20.5303 14.4697ZM19.4697 18.4697C19.1768 18.7626 19.1768 19.2374 19.4697 19.5303C19.7626 19.8232 20.2374 19.8232 20.5303 19.5303L19.4697 18.4697ZM16.1254 16.9447L16.2687 16.2086H16.2687L16.1254 16.9447ZM14.4431 14.6141C14.23 14.2589 13.7693 14.1438 13.4141 14.3569C13.0589 14.57 12.9438 15.0307 13.1569 15.3859L14.4431 14.6141ZM14.4684 16.0065L15.0259 15.5049V15.5049L14.4684 16.0065ZM7.8746 7.05526L8.01789 6.31908L7.8746 7.05526ZM9.55688 9.38587C9.76999 9.74106 10.2307 9.85623 10.5859 9.64312C10.9411 9.43001 11.0562 8.96931 10.8431 8.61413L9.55688 9.38587ZM9.53163 7.99346L8.97408 8.49509L8.97408 8.49509L9.53163 7.99346ZM2 7.75H6.66762V6.25H2V7.75ZM17.3324 17.75H22V16.25H17.3324V17.75ZM22.5303 16.4697L20.5303 14.4697L19.4697 15.5303L21.4697 17.5303L22.5303 16.4697ZM21.4697 16.4697L19.4697 18.4697L20.5303 19.5303L22.5303 17.5303L21.4697 16.4697ZM17.3324 16.25C16.6867 16.25 16.4648 16.2467 16.2687 16.2086L15.9821 17.6809C16.3538 17.7533 16.7473 17.75 17.3324 17.75V16.25ZM13.1569 15.3859C13.4579 15.8875 13.6575 16.2267 13.9108 16.5082L15.0259 15.5049C14.8923 15.3564 14.7753 15.1678 14.4431 14.6141L13.1569 15.3859ZM16.2687 16.2086C15.789 16.1152 15.3528 15.8682 15.0259 15.5049L13.9108 16.5082C14.4556 17.1137 15.1826 17.5253 15.9821 17.6809L16.2687 16.2086ZM6.66762 7.75C7.31332 7.75 7.53519 7.75328 7.73131 7.79145L8.01789 6.31908C7.64616 6.24672 7.25267 6.25 6.66762 6.25V7.75ZM10.8431 8.61413C10.5421 8.11245 10.3425 7.77335 10.0892 7.49182L8.97408 8.49509C9.10771 8.64362 9.22467 8.83219 9.55688 9.38587L10.8431 8.61413ZM7.73131 7.79145C8.21098 7.88481 8.64722 8.13181 8.97408 8.49509L10.0892 7.49182C9.54442 6.88635 8.81735 6.47469 8.01789 6.31908L7.73131 7.79145Z" />
      </svg>
    </div>
  );
};

export default ShuffleButtonSVG;
