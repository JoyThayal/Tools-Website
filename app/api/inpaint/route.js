import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, maskBase64 } = await req.json();

    if (!imageBase64 || !maskBase64) {
      return NextResponse.json(
        { error: "Image and mask are required" },
        { status: 400 },
      );
    }

    const token = process.env.HUGGINGFACE_TOKEN?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "Hugging Face token is missing in environment variables" },
        { status: 500 },
      );
    }

    // Hugging Face ইনপেইন্টিং মডেলের জন্য সরাসরি Base64 পেলোড
    const cleanImg = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const cleanMask = maskBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: cleanImg,
            mask_image: cleanMask,
          },
        }),
      },
    );

    // যদি SDXL বিজি থাকে বা প্রথমবার লোড হতে সময় নেয়, তখন ফাস্ট ফলব্যাক
    if (!response.ok) {
      const errText = await response.text();
      console.warn(
        "Primary inpaint model busy, attempting secondary:",
        errText,
      );

      const fallbackRes = await fetch(
        "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-inpainting",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-wait-for-model": "true",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: {
              image: cleanImg,
              mask_image: cleanMask,
            },
          }),
        },
      );

      if (!fallbackRes.ok) {
        const fallbackErr = await fallbackRes.text();
        return NextResponse.json(
          { error: `Inference failed: ${fallbackErr}` },
          { status: fallbackRes.status },
        );
      }

      const outBuffer = await fallbackRes.arrayBuffer();
      const outBase64 = Buffer.from(outBuffer).toString("base64");
      return NextResponse.json({
        result: `data:image/png;base64,${outBase64}`,
      });
    }

    const outputBuffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(outputBuffer).toString("base64");

    return NextResponse.json({
      result: `data:image/png;base64,${outputBase64}`,
    });
  } catch (error) {
    console.error("Inpaint API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
