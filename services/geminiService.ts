import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeDifferences = async (imageA: File, imageB: File): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const partA = await fileToGenerativePart(imageA);
    const partB = await fileToGenerativePart(imageB);

    const prompt = `
      제공된 두 이미지를 정밀하게 비교 분석해 주세요. 
      첫 번째 이미지는 "원본(Original)"이고, 두 번째 이미지는 "변경본(Modified)"입니다.
      
      두 이미지 사이의 모든 시각적 차이점(추가된 요소, 제거된 요소, 색상 변경, 구조적 변경 등)을 식별하십시오.
      
      각 차이점에 대해 다음을 수행하십시오:
      1. 차이점이 무엇인지 '한국어'로 명확하고 간결하게 설명하십시오.
      2. 해당 차이점의 위치를 나타내는 2D 경계 상자(bounding box) 좌표를 생성하십시오.
      
      마지막으로, 발견된 모든 변경 사항에 대한 전체 요약을 '한국어'로 작성하십시오.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          partA, // Image 1
          partB, // Image 2
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: "당신은 도면, 설계도, 회로도 등의 기술적 이미지를 비교 분석하는 전문가입니다. 두 이미지의 미세한 차이를 정확하게 찾아내고, 이를 한국어로 설명하는 데 특화되어 있습니다.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "차이점에 대한 전체 요약 (한국어)"
            },
            differences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "차이점 고유 ID (예: '1', '2')" },
                  description: { type: Type.STRING, description: "차이점에 대한 설명 (한국어)" },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "경계 상자 좌표 [ymin, xmin, ymax, xmax] (0-1000 스케일)",
                    minItems: 4,
                    maxItems: 4
                  }
                },
                required: ["id", "description", "box_2d"]
              }
            }
          },
          required: ["summary", "differences"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response text from Gemini");
    }

  } catch (error) {
    console.error("Error analyzing images:", error);
    throw error;
  }
};