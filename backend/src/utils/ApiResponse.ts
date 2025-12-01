class ApiResponse {
    public success:boolean;
    constructor(public statusCode:number,public message:string,public data:any=null){
        this.success=statusCode<400;
        this.statusCode=statusCode;
        this.message=message
        this.data=data;
    }

}
export {ApiResponse}