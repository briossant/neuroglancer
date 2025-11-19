import { ImageRenderLayer } from "#src/sliceview/volume/image_renderlayer.js";
import type {
  ShaderParameters} from "#src/sliceview/volume/segmentation_renderlayer.js";
import {
  SegmentationRenderLayer
} from "#src/sliceview/volume/segmentation_renderlayer.js";
import type { ShaderBuilder } from "#src/webgl/shader.js";
import type { ShaderControlsBuilderState } from "#src/webgl/shader_ui_controls.js";

export class OptimisticSegmentationRenderLayer extends SegmentationRenderLayer {
  setGLBlendMode(gl: WebGL2RenderingContext) {
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );
  }

  defineShader(builder: ShaderBuilder, parameters: ShaderParameters) {
    builder.addFragmentCode(`
      void emitOptimistic(vec4 color) {
        v4f_fragData0 = vec4(color.rgb * color.a, color.a);
      }
      #define emit emitOptimistic
    `);
    super.defineShader(builder, parameters);
  }
}

export class OptimisticImageRenderLayer extends ImageRenderLayer {
  setGLBlendMode(gl: WebGL2RenderingContext) {
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );
  }

  defineShader(
    builder: ShaderBuilder,
    shaderBuilderState: ShaderControlsBuilderState,
  ) {
    super.defineShader(builder, shaderBuilderState);
    builder.addFragmentCode(`
#undef emitRGBA
#undef emitRGB
#undef emitGrayscale
void emitRGBA(vec4 rgba) {
  emit(vec4(rgba.rgb * rgba.a, rgba.a));
}
void emitRGB(vec3 rgb) {
  emit(vec4(rgb * uOpacity, uOpacity));
}
void emitGrayscale(float value) {
  emit(vec4(vec3(value) * uOpacity, uOpacity));
}
`);
  }
}
