# services/patchtst_model.py
import torch
import torch.nn as nn


class PatchTST(nn.Module):
    def __init__(
        self,
        n_features: int,
        horizon: int,
        d_model: int = 64,
        n_heads: int = 4,
        n_layers: int = 2
    ):
        super().__init__()

        self.input_proj = nn.Linear(n_features, d_model)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            batch_first=True
        )

        self.encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=n_layers
        )

        self.head = nn.Linear(d_model, horizon)

    def forward(self, x):
        # x: (batch, seq_len, features)
        x = self.input_proj(x)
        x = self.encoder(x)
        x = x.mean(dim=1)      # temporal pooling
        return self.head(x)
