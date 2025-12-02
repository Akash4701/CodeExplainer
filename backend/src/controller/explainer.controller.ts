import { generateCodeNarration } from "../../components/generatePrompt.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import type{ Request, Response } from "express";

export const explainCode=asyncHandler(async(req: Request, res: Response)=>{
    const {codeSnippet,language}=req.body;
    console.log("Received request to explain code in language:", language);
    console.log('Recieved code',codeSnippet);

    const  explanation=await generateCodeNarration(codeSnippet,language);
    res.json({explanation});

	
});