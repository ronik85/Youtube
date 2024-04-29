class ApiResponse {
  constructor(statucode, data, message = "success") {
    this.data = data;
    this.statucode = statucode;
    this.message = message;
    this.success = statucode < 400;
  }
}

export { ApiResponse };
